export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed"
        });

    }


    try {

        const apiKey =
            process.env.GEMINI_API_KEY;


        if (!apiKey) {

            return res.status(500).json({
                error:
                    "GEMINI_API_KEY environment variable is missing."
            });

        }


        const {
            message,
            image,
            model
        } = req.body || {};


        const selectedModel =
            model || "gemini-3.1-flash-lite";


        const parts = [];


        if (message && message.trim()) {

            parts.push({
                text: message.trim()
            });

        }


        if (image && image.data) {

            parts.push({

                inline_data: {

                    mime_type:
                        image.mimeType ||
                        "image/jpeg",

                    data:
                        image.data

                }

            });

        }


        if (!parts.length) {

            return res.status(400).json({
                error:
                    "Message or image is required."
            });

        }


        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;


        const response =
            await fetch(
                url,
                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json"
                    },

                    body:JSON.stringify({

                        contents:[
                            {
                                parts:parts
                            }
                        ]

                    })

                }
            );


        const data =
            await response.json();


        if(!response.ok){

            return res.status(
                response.status
            ).json({

                error:
                    data?.error?.message ||
                    "Gemini API request failed."

            });

        }


        const reply =
            data?.candidates?.[0]
            ?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();


        if(!reply){

            return res.status(502).json({

                error:
                    "Gemini returned an empty response."

            });

        }


        return res.status(200).json({

            reply:reply

        });


    } catch(error) {

        console.error(error);


        return res.status(500).json({

            error:
                error.message ||
                "Internal server error."

        });

    }

    }
