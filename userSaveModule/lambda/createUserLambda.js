import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb"

const region = process.env.AWS_REGION;

const client = new DynamoDBClient({ region })

export const handler = async (event, context) => {
    console.log("Recieved event: ",JSON.stringify(event, null, 2));

    let body;
    try{
        if (typeof event.body === 'string') {
            body = JSON.parse(event.body);  // Parse the string body
        } else {
            body = event.body;  // Body is already an object
        }
        console.log("Recieved body: ",body);
    }catch(error){
        console.log("Invalid JSON format", error);
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

    const tableName = process.env.TABLE_NAME;
    if(!tableName){
        console.log("Missing table name");
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow from anywhere
                "Access-Control-Allow-Credentials": "true",
                //"Access-Control-Allow-Headers": "Content-Type",
                //"Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ message: "Missing table name"})
        }
    }

    const { username, email } = body;
    console.log("Recieved username: ",username);
    console.log("Recieved email: ",email);

    if(!username || !email) {
        console.log("Missing username or email");
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow from anywhere
                "Access-Control-Allow-Credentials": "true",
                //"Access-Control-Allow-Headers": "Content-Type",
                //"Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ message: "Missing username or email" }),
        };
    }

    const createdOn = new Date().toISOString();

    const params = {
        TableName: tableName,
        Item: {
            username: {S: username },
            email: {S: email},
            createdOn: {S: createdOn}
        },
    };

    try{
        const data = await client.send(new PutItemCommand(params));
        console.log("Success, item inserted", data);
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow from anywhere
                "Access-Control-Allow-Credentials": "true",
                //"Access-Control-Allow-Headers": "Content-Type",
                //"Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify( {message: "User data saved successfully"}),
        }
    } catch(error){
        console.error("Error occured while inserted user data ", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow from anywhere
                "Access-Control-Allow-Credentials": "true",
                //"Access-Control-Allow-Headers": "Content-Type",
                //"Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({message: "Failed to save user data"}),
        }
    }
}