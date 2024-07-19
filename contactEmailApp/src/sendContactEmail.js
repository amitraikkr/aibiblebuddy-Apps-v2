import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: 'us-east-2' });  // Replace with your region

export const handler = async (event) => {
    const recipient = process.env.SENDER_EMAIL;
    if (!recipient) {
        console.error('Sender Email is missing');
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow from anywhere
                "Access-Control-Allow-Credentials": "true",
                //"Access-Control-Allow-Headers": "Content-Type",
                //"Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ message: 'Sender Email is missing' })
        };
    }
    
    console.log('Recieved Event: ',event);

    let body;
    try{
        body = JSON.parse(event.body);
    }catch(error){
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow from anywhere
                "Access-Control-Allow-Credentials": "true",
                //"Access-Control-Allow-Headers": "Content-Type",
                //"Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({message: "Invalid JSON format"}),
        }
    }

    const from = body.from;
    const subject = body.subject;
    const bodyText = body.body_text;
    const bodyHtml = body.body_html;


    if (!from || !subject || !bodyText || !bodyHtml) {
        console.error('From Email, Subject, and Message should not be Empty');
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'From Email, Subject, and Message should not be Empty' })
        };
    }

    try {
        const params = {
            Source: recipient,
            Destination: {
                ToAddresses: [recipient]
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Text: {
                        Data: bodyText,
                        Charset: 'UTF-8'
                    },
                    Html: {
                        Data: bodyHtml,
                        Charset: 'UTF-8'
                    }
                }
            }
        };

        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('Email sent successfully', response);
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow from anywhere
                "Access-Control-Allow-Credentials": "true",
                //"Access-Control-Allow-Headers": "Content-Type",
                //"Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ message: 'Email sent successfully' })
        };

    } catch (error) {
        console.error('Error sending email', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow from anywhere
                "Access-Control-Allow-Credentials": "true",
                //"Access-Control-Allow-Headers": "Content-Type",
                //"Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ message: 'Error sending email' })
        };
    }
};