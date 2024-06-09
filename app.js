const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const dialogflow = require('@google-cloud/dialogflow');
const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const express = require("express");
const nodemailer = require("nodemailer");
const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = "AIzaSyDnCoBT3VyVr5QhrymFQyoxDCABuZuXVA0";

async function runChat(queryText) {
    const genAI = new GoogleGenerativeAI("AIzaSyDnCoBT3VyVr5QhrymFQyoxDCABuZuXVA0");
    // console.log(genAI)
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {  
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 60,
        responseMimeType: "text/plain",
    };

    const chat = model.startChat({
        generationConfig,
        history: [
        ],
    });

    const result = await chat.sendMessage(queryText);
    const response = result.response;
    return response.text();
}

const webApp = express();
const PORT = process.env.PORT || 5000;
webApp.use(express.urlencoded({
    extended: true
}));
webApp.use(express.json());
webApp.use((req, res, next) => {
    console.log(`Path ${req.path} with Method ${req.method}`);
    next();
});
webApp.get('/', (req, res) => {
    res.sendStatus(200);
    res.send("Status Okay")
});

webApp.post('/dialogflow', async (req, res) => {

    var id = (res.req.body.session).substr(43);
    console.log(id)
    const agent = new WebhookClient({
        request: req,
        response: res
    });

    async function fallback() {
        let action = req.body.queryResult.action;
        let queryText = req.body.queryResult.queryText;

        if (action === 'input.unknown') {
            let result = await runChat(queryText);
            agent.add(result);
            console.log(result)
        }else{
            agent.add(result);
            console.log(result)
        }
    }
    function hi(agent) {
        console.log(`intent  =>  Default Welcome Intent`);
        agent.add('Hi, I am your AI Assistant from Saylani , Tell me how can I help you')
    }

    function studentform(agent) {
        const{name,email, city,phone,  number,Course } = agent.parameters;
        console.log(`intent  =>  studentform`);
        
        const accountSid = 'ACf691d78511c40ad60551b4eab5fed6f0';
const authToken = "0790bc23c37194681cf28ef43b7e80b0";
const client = require('twilio')(accountSid, authToken);

    //TEMRXJAX939ZDNYUXJSGXTUN twillio recovery code
        agent.add('We have recieved all your details plz check your email')
 
        client.messages
        .create({
            body: `hello dear ${name}! we have recieved your details with your email ${email} your location is ${city}, your Contact number ${phone} and your CNIC ${number} your course selection ${Course}. ThankYou For your feedback at Saylani
            
            `,
                from: '+17076257659',
        to: '+923218795135'
    })
    .then(message => console.log(message.sid))

    var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'owaisameerofficial@gmail.com',
    pass: 'cidexaenedpcwlmz'
  }
});

var mailOptions = {
    from: 'owaisameerofficial@gmail.com ',
    to : 'hammadn788@gmail.com',
    cc :'hammadn788@gmail.com',
    subject: 'Thank You for your feedback',
    html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dcdcdc; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <img src="https://play-lh.googleusercontent.com/dGp-bVuxKn-J-v744tzYnruh0bUdslcQJ43PPQEXxt4vjsHr3NPB_pxECO1mp57dWjY" alt="Saylani Logo" style="width: 100px; height: auto; display: block; margin: 20px auto;">    
                <h2 style="text-align: center; color: #4CAF50;">Thank You for Your Feedback</h2>
                    <p>Dear ${name},</p>
                    <p>We have received your details as follows:</p>
                    <div style="border: 1px solid #dcdcdc; padding: 15px; border-radius: 10px; background-color: #f9f9f9;">
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Teacher Email:</strong>hammadn788@gmail.com)</p>
                        <p><strong>Location:</strong> ${city}</p>
                        <p><strong>Contact Number:</strong> ${phone}</p>
                        <p><strong>CNIC:</strong> ${number}</p>
                        <p><strong>Course Selection:</strong> ${Course}</p>
                    </div>
                    <p>Thank you for your feedback at Saylani.</p>
                    <p>Best regards,</p>
                    <p>Saylani Welfare<br> SMIT Department</p>

                    
                </div>
        `
    };
    // text: `hello dear ${name}! we have recieved your details with your email ${email} your location is ${city}, your Contact number ${phone} and your CNIC ${number} your course selection ${Course}. ThankYou For your feedback at Saylani`, };
      
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

    }



    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', hi);
    intentMap.set('studentform', studentform);
    intentMap.set('Default Fallback Intent', fallback);
    agent.handleRequest(intentMap);
});



webApp.listen(PORT, () => {
    console.log(`Server is up and running at http://localhost:${PORT}/`);
});