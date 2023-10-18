const { Client,LocalAuth, Buttons, List } = require('whatsapp-web.js');
const { google } = require('googleapis');
const express = require('express');
const sheets = google.sheets('v4');
const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');
const qrcode = require('qrcode-terminal');
const { json } = require('express');
let detail1 ='';
let detail2 = '';
let detail3 = '';
let detail4,detail5,inquirydetail = '';
let stayID = '';
let location = '';
let globalInquiryNumber = 0;
const app = express();
const port = 3000;
const CLIENT_ID = '522670032468-hk1d30348682h4q0qdflb9o1boos3583.apps.googleusercontent.com';
const CLIENT_SECRET = '0F-FAg2J_4ZrIAHkm0D5Lm7g'
const REDIRECT_URI = 'http://localhost:3000'
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';
const stayLinks = require('./texts.json');
const http = require('http');

// const PORT = process.env.PORT || 3000; // Use the specified PORT or default to 3000

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello, World!\n');
// });

// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// app.get('/auth', (req, res) => {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });

//   res.redirect(authUrl);
// });
app.get('/', async (req, res) => {
  
  

  res.send("Hello Bunkout")
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


const client = new Client({
  authStrategy: new LocalAuth(),
});








async function fetchVendorForProduct(productID) {

  const googleAuth = new google.auth.GoogleAuth({
    keyFile: 'bunkout-new.json',
    scopes: SCOPES
  });

  const googleClient = await googleAuth.getClient();
  const googleSheets = google.sheets({ version: 'v4', auth: googleClient });

  // Authenticate with Google Sheets API

  // Define the spreadsheetId and range for your Google Sheet
  const spreadsheetId = '1ugjVDdvPvweegxG7h5of0bO2W8iRfkHZvAgfiijy_Yc';
  const range = 'Sheet1'; // Modify this to include all columns you need (e.g., 'Sheet1!A:B')
  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const dataRows = getRows.data.values;

  // Fetch the entire sheet data

  

  // Find the row where the product ID matches column B
  const matchingRow = dataRows.find((row) => row[1] === productID);

  if (matchingRow) {
    // Return the vendor number from column A
    return matchingRow[0];
  }

  else{

  // If no match is found, return null or handle the case as needed
  return null;
}}

catch (error) {
  console.error('Error fetching data:', error);
  throw new Error('Error fetching data from Google Sheets');
}}


async function fetchTextForStayID(stayID) {
  const googleAuth = new google.auth.GoogleAuth({
    keyFile: 'bunkout-new.json',
    scopes: SCOPES
  });

  const googleClient = await googleAuth.getClient();
  const googleSheets = google.sheets({ version: 'v4', auth: googleClient });
  const spreadsheetId = '1ugjVDdvPvweegxG7h5of0bO2W8iRfkHZvAgfiijy_Yc';
  const range = 'Sheet1';

  try {
    const response = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const dataRows = response.data.values;

    // Find the row where the stayID matches column B
    const matchingRow = dataRows.find((row) => row[1] === stayID);

    if (matchingRow) {
      // Return the text from column C
      return matchingRow[2];
    } else {
      // If no match is found, return null or handle the case as needed
      return null;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Error fetching data from Google Sheets');
  }
}




function askForDetail(recipient, prompt) {
  return new Promise((resolve) => {
    client.on('message', (message) => {
      if (message.from === recipient) {
        resolve(message.body);
      }
    });

    client.sendMessage(recipient, prompt);
  });
}
let welcome = `
    *Hey Welcome To Bunkout*
This is Anuj your Virtual Help Assistant
How can I help you today?
*Type A* :👉 For getting details of any stay or any location
*Type B* :👉 For Sending Booking Inquiry for a stay or any location
*Type C* :👉 To Get Information about Existing Booking
*Type D* :👉 For Something Else
`;

client.initialize();
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    if(message.body.startsWith('Hello') || message.body.startsWith('Hi') || message.body == '0' || message.body.toUpperCase == 'TYPE 0') {
     console.log('Sending...')
     
        client.sendMessage(message.from, welcome);
    }

    if(message.body.toUpperCase() == 'A' || message.body.toUpperCase() == 'TYPE A'){
      client.sendMessage(message.from,`
    *Great! We can send details to you, Please*
      *Type E*:👉 If you know the stay ID
      (Note: Stay ID is the unique ID of any stay, it mentioned in all our posts on social networks and on website)

      *Type F*:👉 If you want to know the details of all stays in a location
      
      
      *Type 0*:👉 To Navigate back to Main menu`)
    } 

    if(message.body.toUpperCase() == 'E' || message.body.toUpperCase() == 'TYPE E'){
      stayID = await askForDetail(message.from, `
    *Please enter Stay ID*
      Note: Stay IDs are in format BOS050,BOS081 etc.`)
      const custStayID = stayID;
      
      
      if(custStayID.toUpperCase() === 'BOS022'){
        await client.sendMessage(message.from, stayLinks.stayIDs.BOS022);
        await client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry Type 0 or say Hello`)
        console.log('Details sent');
      }
      if(custStayID.toUpperCase() === 'BOS023'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS023);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() === 'BOS024'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS024);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() === 'BOS025'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS025);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() === 'BOS026'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS026);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() === 'BOS027'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS027);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() === 'BOS028'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS028);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() === 'BOS029'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS029);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() === 'BOS030'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS030);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() === 'BOS031'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS031);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS032'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS032);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS033'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS033);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS034'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS034);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS035'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS035);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*o`)
      }
      if(custStayID.toUpperCase() == 'BOS036'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS036);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS037'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS037);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS038'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS038);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS039'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS039);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS040'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS040);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS041'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS041);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS041'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS041);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS042'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS042);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS050'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS050);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS053'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS053);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS054'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS054);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS055'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS055);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }

      if(custStayID.toUpperCase() == 'BOS056'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS056);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }

      if(custStayID.toUpperCase() == 'BOS057'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS057);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }

      if(custStayID.toUpperCase() == 'BOS059'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS059);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }

      if(custStayID.toUpperCase() == 'BOS060'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS060);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS061'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS061);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS062'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS062);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS063'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS063);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS064'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS064);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS065'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS065);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS066'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS066);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS067'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS067);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS068'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS068);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS069'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS069);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS070'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS070);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS071'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS071);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS072'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS072);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS073'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS073);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS074'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS074);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS075'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS075);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry Type 0 or say Hello`)
      }
      if(custStayID.toUpperCase() == 'BOS076'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS076);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS077'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS077);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS078'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS078);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS079'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS079);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS080'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS080);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS081'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS081);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS082'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS082);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS083'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS083);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS084'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS084);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS085'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS085);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS106'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS106);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS146'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS146);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      if(custStayID.toUpperCase() == 'BOS140'){
        client.sendMessage(message.from, stayLinks.stayIDs.BOS140);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }
      else{
        let link = `https://bunkout.in/listings/?keyword_search=${custStayID}&location_search=&tax-listing_category=&action=listeo_get_listings`
        client.sendMessage(message.from,link);
        client.sendMessage(message.from,`
    All Details are in link sent above
        To raise further Inquiry *Type 0* or say *Hello*`)
      }

    }

    else{
      if(message.body == 'F' || message.body.toUpperCase() == 'TYPE F'){
        location = await askForDetail(message.from, `
    *Please enter Location for your Vacation*
      Note: Enter location in full format like Lonavla,Wayanad etc`)
        let locationLink = `https://bunkout.in/listings/?keyword_search=${location}&location_search=&tax-listing_category=&action=listeo_get_listings`
        client.sendMessage(message.from,`
    All Stays for your Location: *${location}* is there in the link below`)
        client.sendMessage(message.from,locationLink)
        client.sendMessage(message.from,`
    * To raise more enquiries Go back to main Menu*
        *Type 0*:👉 To raise more inquiries`)
      }
    }



    if(message.body.toUpperCase() === 'B' || message.body.toUpperCase == 'TYPE B'){
       detail1 = await askForDetail(message.from, `
  *Please Send the Stay ID or Location of your stay*
    Note: Exact Stay ID provides quicker response`);
      
      // Ask for the second detail
      detail2 = await askForDetail(message.from, `
  *Great Now, please send Checkin Date*
  
  To Go Back to Main Menu Type 0 or say Hello`);
      
      // Ask for the third detail
      detail3 = await askForDetail(message.from, `
  *Thanks, Now Please send Checkout Date.*
  
  To Go Back to Main Menu Type 0 or say Hello`);

      detail4 = await askForDetail(message.from, '*Please let us know how many people are there?')

      detail5 = await askForDetail(message.from, `
  *If you entered a location , please let us know your budget as well*
    If you entered Stay ID please enter NA`)




    globalInquiryNumber++;
    const formattedInquiryNumber = `BUN${globalInquiryNumber.toString().padStart(3, '0')}`;
      // You have collected all three details, and you can proceed with further actions
      

      // const formattedDetails = `Enquiry:\n${detail1}\n${detail2}\n${detail3}`;
      // const vendorPhoneNumbers = await fetchVendorPhoneNumbers();
      
      const customerProductID = detail1;
      let link = `https://bunkout.in/listings/?keyword_search=${customerProductID}&location_search=&tax-listing_category=&action=listeo_get_listings`
  // Check if the customer's product ID matches any in the Google Sheets
  const vendorNumber = await fetchVendorForProduct(customerProductID);
  const stayDetails = await fetchTextForStayID(customerProductID);

  if (vendorNumber) {
    // Send the inquiry message to the vendor associated with the product
    const vendorMessage = `
    *New Inquiry Received*
    *StayID/Location*: ${customerProductID}
    *Details*: ${stayDetails}
    *Inquiry Number*: ${formattedInquiryNumber}
    *Checkin Date*: ${detail2}
    *Checkout Date*: ${detail3}
    *Number of People*: ${detail4}

    *Type 1* to *Accept*
    *Type 2* to *Reject*

    Thanks,
    Team Bunkout
    https://bunkout.in/
    `
    
    
    await client.sendMessage(vendorNumber, vendorMessage);
  } else {
    // Handle the case where no matching product ID is found
    const noVendorMessage = `
    *No Vendor Found Inquiry Received*
*Inquiry Number*: ${formattedInquiryNumber}
*Stay ID/Location*: ${detail1}
*Details*: ${stayDetails}
*Checkin Date*: ${detail2}
*Checkout Date*: ${detail3}
*Number of people*: ${detail4}
*Budget per night*: ${detail5}`

    client.sendMessage('919451757000@c.us', noVendorMessage);
  }

  // Send a response to the customer as needed
  
 
  const customerMessage = `
*Your inquiry has been sent*
*Inquiry Number*: ${formattedInquiryNumber}
*Stay ID/Location*: ${detail1}
*Checkin Date*: ${detail2}
*Checkout Date*: ${detail3}
*Number of people*: ${detail4}
*Budget per night*: ${detail5}`
  client.sendMessage(message.from, customerMessage);
}


      // Send inquiries to vendors
      // for (const phoneNumber of vendorPhoneNumbers) {
      //   await client.sendMessage(phoneNumber, `New Inquiry:\n${detail1}\n${detail2}\n${detail3}`);
      // }
      // client.sendMessage(message.from, formattedDetails);
    //}
    if(message.body.toUpperCase() === 'C' || message.body.toUpperCase == 'TYPE C') {
      inquirydetail = await askForDetail(message.from, '*Sure Please let us Know your Inquiry Number*')
      const inquiryMessage = `
    Thanks we will update you on Inquiry Number: *${inquirydetail}* shortly`
    client.sendMessage(message.from,inquiryMessage)
    }
    if(message.body.toUpperCase() === 'D' || message.body.toUpperCase == 'TYPE D') {
     client.sendMessage(message.from,'Please let us know your query')
    }
    
});