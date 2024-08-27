// Dependencies 
const express = require('express'); // For backend stuff.
const cors = require('cors');
const dotenv = require('dotenv'); // For using environmental variables.
const {Client} = require('pg'); // For PSQL queries
const bcrypt = require('bcrypt'); // For hashing passwords
const { v4: uuidv4 } = require('uuid'); // For generating tokens.
const nodemailer = require('nodemailer'); // For sending emails.
const path = require('path'); // For directory operation.

const app = express();


dotenv.config();
app.use(cors());
app.use(express.json());
/*
TODO: handle errors.
TODO: Add route to frontend main page.
*/ 

// Database stuff

async function insertUserIntoDatabase(userKey, email, username, password) {

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mainuscript',
    password: process.env.PSQL_PASSWORD,
    port: 5432,  // Default PostgreSQL port
  });
  client.connect();

  const insertUserQuery = `
  INSERT INTO users(user_auth_key, email, username, password) 
  VALUES('${userKey}', '${email}', '${username}', '${password}');
  `;
  console.log("Sending PSQL Query:", passwordQuery);
  const insertUserRes = await client.query(insertUserQuery).catch(err => console.error("PSQL:", err));
  console.log("INSERT INTO result:", insertUserRes);
  client.end();
}


async function getUserKeyFromDatabase(username, password) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mainuscript',
    password: process.env.PSQL_PASSWORD,
    port: 5432,  // Default PostgreSQL port
  });
  client.connect();

  const passwordQuery = `
  SELECT password FROM users WHERE username='${username}';
  `;
  console.log("Sending PSQL Query:", passwordQuery);
  const passwordRes = await client.query(passwordQuery).catch(err => console.error("PSQL:", err));

  if(passwordRes.rows.length === 0) {
    // No user found
    console.log("No user found with username:", username);
    return "";
  }
  console.log("Password found of username:", username);
  //Verify password
  const hashedPassword = passwordRes.rows[0].password;
  console.log("Verifying password...");
  const passwordVerified = await verifyPassword(password, hashedPassword);
  if (passwordVerified) { // If valid, get user key.
    const userKeyQuery = `
    SELECT user_auth_key FROM users WHERE username='${username}';
    `;
    console.log("Sending PSQL Query:", userKeyQuery);
    const keyRes = await client.query(userKeyQuery).catch(err => console.error("PSQL:", err));
    client.end();
    return keyRes.rows[0].user_auth_key;
  }
  client.end();
  return "";
}


async function deleteUserFromDatabase(userKey) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mainuscript',
    password: process.env.PSQL_PASSWORD,
    port: 5432,  // Default PostgreSQL port
  });
  client.connect();

  const deleteQuery = `
  DELETE FROM users WHERE user_auth_key='${userKey}';
  `;
  console.log("Sending PSQL Query:", deleteQuery);
  const deleteRes = await client.query(deleteQuery).catch(err => console.error("PSQL:", err));
  console.log("PSQL DELETE Result:", deleteRes);
  client.end();
}

async function checkUserInDatabase(username, email) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mainuscript',
    password: process.env.PSQL_PASSWORD,
    port: 5432,  // Default PostgreSQL port
  });
  client.connect();
  const bothQuery = `
  SELECT username FROM users WHERE username='${username}' AND email='${email}';
  `;

  const emailQuery = `
  SELECT email FROM users WHERE email='${email}';
  `;

  const usernameQuery = `
  SELECT username FROM users WHERE username='${username}';
  `;
  console.log("Sending PSQL Queries:", bothQuery, "\n", emailQuery, "\n", usernameQuery);
  const bothRes = await client.query(bothQuery).catch(err => console.error("PSQL:", err));
  const usernameRes = await client.query(usernameQuery).catch(err => console.error("PSQL:", err));
  const emailRes = await client.query(emailQuery).catch(err => console.error("PSQL:", err));
  client.end();

  if (bothRes.rows.length === 1) {
    console.log("Username:", username,"and email:", email,"already registered with another account.");
    return "Username and email already registered with another account.";
  } else if (usernameRes.rows.length === 1) {
    console.log("Username:", username , "already taken.");
    return "Username already taken.";
  } else if (emailRes.rows.length === 1) {
    console.log("Email:", email , "already registered with another account.");
    return "Email already registered with another account.";
  }

  // Eligible for insert
  console.log("Username:", username,"and email:", email,"eligible for insertion.");
  return "";
}

async function generateAndinsertTokenIntoDatabase(usernameOrEmail) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mainuscript',
    password: process.env.PSQL_PASSWORD,
    port: 5432,  // Default PostgreSQL port
  });
  client.connect();

  // Fetch email.
  const getEmailQuery = `
  SELECT email FROM users WHERE username='${usernameOrEmail}' OR email='${usernameOrEmail}';
  `
  console.log("Sending PSQL Query:", getEmailQuery);
  const emailRes = await client.query(getEmailQuery).catch(err => console.error("PSQL:", err));

  if(emailRes.rows.length === 1) {
    const email = emailRes.rows[0].email;
    console.log("Found email:", email);
    // Generate token
    const token = uuidv4();
    console.log("Generated token:", token);
    // Insert token
    const insertTokenQuery = `
    INSERT INTO tokens(token, expiration_time, email) 
    VALUES ('${token}', NOW() + INTERVAL '1 hour', '${email}');
    `
    console.log("Sending PSQL Query:", insertTokenQuery);
    await client.query(insertTokenQuery).catch(err => console.error("PSQL:", err));
    client.end();
    // Return token for generating email link.
    return {token: token, email: email};
  }
  console.log("Email not found of:", usernameOrEmail);
  return false;
}

async function checkValidTokenInDatabase(token) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mainuscript',
    password: process.env.PSQL_PASSWORD,
    port: 5432,  // Default PostgreSQL port
  });
  client.connect();

  const getValidTokenQuery = `
  SELECT token FROM tokens WHERE token='${token}' AND expiration_time > NOW();
  `
  console.log("Sending PSQL Query:", getValidTokenQuery);
  const tokenRes = await client.query(getValidTokenQuery).catch(err => console.error("PSQL:", err));
  client.end();
  if(tokenRes.rows.length === 1) {
    console.log("Valid token found");
    return true;
  } else {
    console.log("No valid token found");
    return false;
  }
}

async function updatePasswordInDatabase(newPassword, token) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mainuscript',
    password: process.env.PSQL_PASSWORD,
    port: 5432,  // Default PostgreSQL port
  });
  client.connect();

  const getEmailQuery = `
  SELECT email FROM tokens WHERE token='${token}';
  `
  console.log("Sending PSQL Query:", getEmailQuery);
  const emailRes = await client.query(getEmailQuery).catch(err => console.error("PSQL:", err));
  
  if(emailRes.rows.length === 1) {
    const email = emailRes.rows[0].email;
    console.log("Email found:", email);
    console.log("Hashing password...");
    const hashedPassword = await hashPassword(newPassword);
    const updatePasswordQuery = `
    UPDATE users SET password='${hashedPassword}' WHERE email='${email}';
    `
    console.log("Sending PSQL Query:", updatePasswordQuery);
    await client.query(updatePasswordQuery).catch(err => console.error("PSQL:", err));
    client.end();
    return true;
  } 
  console.error("No unique corresponding email with token", token);
  client.end();
  return false;
}

// Password helper functions

async function hashPassword(password) {
  // Hashing the password
  const hashedPassword = await bcrypt.hash(password, 10)
    .then(hash => {console.log("Hashed password:", hash); return hash;})
    .catch(err => console.error('error:' + err));
  return hashedPassword;
}

async function verifyPassword(password, hashedPassword) {
  const verification = await bcrypt.compare(password, hashedPassword)
    .then(isMatch => {console.log("Password Verification:", isMatch); return isMatch;})
    .catch(err => console.error('error:' + err));
  return verification;
}


// Handlers

const chatHandler = async (req, res) => {
  console.log("Handling chat request...", req.body);
    const origMessage = req.body.message.replace(/[\r\n]+/g, '');
    const userKey = req.body.userKey;
    const convoId = req.body.convoId;
    let convo;
    
    if(convoId) {
      console.log("Going to convo:", convoId);
      convo = await getConvo(userKey, convoId);
    } else {
      console.log("Creating convo.");
      convo = await createConvo(userKey);
      console.log("Created Convo:", convo.id);
      await sendMessage(userKey, convo.id, "Hi");
    }

    // Send the message
    if (origMessage) {
      console.log("Sending message:", origMessage);
      await sendMessage(userKey, convo.id, origMessage);
    } 

    // Check if message has been received
    let messages = null;
    while(true) {
      console.log("Fetching message list...");
      messages = await listMessages(userKey, convo.id);
      if (!origMessage || (messages[0].payload.type === 'card' && 
        messages[0].payload.title.replace(/[\r\n]+/g, '') === origMessage)) {
        break;
      } 
    }
    // Snip initialization messages.
    console.log("Packaging messages...");
    const trueMessages = messages.slice(0, -2).filter(message => message.payload.type === 'card');

    // Send updated gallery upon new conversation.
    let intros = [];
    if(!convoId) {
      console.log("Packaging intros to update gallery...");
      const convos = await listConvos(userKey);
      const convoIds = convos.map(convoObj => convoObj.id);
      for (const convoIdd of convoIds) {
        const messages = await listMessages(userKey, convoIdd);
        intros.push(messages[messages.length - 4]);
      }
      console.log("Sending response:", {log: trueMessages, userKey: userKey, intros: intros});
      res.json({log: trueMessages, userKey: userKey, intros: intros});
    } else {
      console.log("Sending response:", {log: trueMessages, userKey: userKey, intros: intros});
      res.json({log: trueMessages, userKey: userKey, intros: intros});
    }
}

const loginHandler = async (req, res) => {
  console.log("Handling login request...", req.body);
  const username = req.body.username;
  const password = req.body.password;
  console.log("Getting user key from database...");
  const userKey = await getUserKeyFromDatabase(username, password);
  //If user found.
  if(userKey) {
    //Login user.
    console.log("User logging in:", userKey);
    // Fetch and process intros for gallery.
    console.log("Packaging intros to update gallery...");
    const convos = await listConvos(userKey);
    const convoIds = convos.map(convoObj => convoObj.id);
    let intros = [];
    for (const convoId of convoIds) {
      const messages = await listMessages(userKey, convoId);
      intros.push(messages[messages.length - 4]);
    }
    console.log("Sending response:", {userKey: userKey, intros: intros});
    res.json({userKey: userKey, intros: intros});
  } else {
    console.log("User not found or password invalid");
    console.log("Sending response:", {userKey: userKey});
    res.json({userKey: userKey});
  }
}

const signUpHandler = async (req, res) => {
  console.log("Handling sign up request...", req.body);
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  // Check if user is already in database.
  console.log("Checking if user is in database...");
  const accountExistsRes = await checkUserInDatabase(username, email);
  if(!accountExistsRes) {
     // Create user
    console.log("User signing up...");
    console.log("Creating user key...")
    const userAndKey = await createUser(username);
    console.log("Generated key:", userAndKey.key);
    console.log("Hashing password...");
    const hashedPassword = await hashPassword(password);
    console.log("Hashed password:", hashedPassword);
    //Add user to database.
    console.log("Inserting user into database...");
    await insertUserIntoDatabase(userAndKey.key, email, username, hashedPassword);
    // Login user.
    console.log("Inserted user:", userAndKey.key);
    console.log("Sending response:", {userKey: userAndKey.key});
    res.json({userKey: userAndKey.key});
  } else {
    console.log("Sign up refused:", accountExistsRes);
    console.log("Sending response:", {message: accountExistsRes});
    res.json({message: accountExistsRes});
  }
}

const deleteConvoHandler = async (req, res) => {
  console.log("Handling delete conversation request...", req.body);
  const userKey = req.body.userKey;
  // Delete convo of user
  console.log("Deleting conversation...");
  await deleteConvo(userKey, convoId);
  console.log("Sending response:", {message: `Deleted conversation: ${convoId} of user: ${userKey}`});
  res.json({message: `Deleted conversation: ${convoId} of user: ${userKey}`});
}

const deleteUserHandler = async (req, res) => {
  console.log("Handling delete user request...", req.body);
  const userKey = req.body.userKey;
  //Prevents guest account from being deleted.
  if (userKey !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMDFKNTQ3U01HU0YwM0dCVjBRUTdYQ0RHWVEiLCJpYXQiOjE3MjM0OTgwMjV9.9mgky1Wb35jMnEwVOoNnGRW1P5sMnnxXDULBcCtk8Eo") {
    //Delete from database.
    console.log("Deleting user from database...");
    await deleteUserFromDatabase(userKey);
    // Delete convo of user
    console.log("Deleting user from botpress database.");
    await deleteUser(userKey);
    console.log("Sending response:", {message: `Deleted User: ${userKey}`});
    res.json({message: `Deleted User: ${userKey}`});
  } else {
    console.log("Someone is attempting to delete the guest account.");
    console.log("Sending response:", {message: "This account is restricted from being deleted"});
    res.json({message: "This account is restricted from being deleted"});
  }
}

const requestPasswordResetHandler = async (req, res) => {
  console.log("Handling password reset request...", req.body);
  const usernameOrEmail = req.body.usernameOrEmail;
  // Generate time sensitive token
  console.log("Generating and inserting a time sensitive token into database...");
  const {token, email} = await generateAndinsertTokenIntoDatabase(usernameOrEmail);
  // Send email. 
  console.log("Packaging email...");
  const emailURL=`http://localhost:3000/user/loadResetPasswordPage?token=${token}`;
  // Send endpoint to user via email..
  let transporter = nodemailer.createTransport({
    service: 'Gmail', // you can also use another service or SMTP details
    auth: {
      user: 'chanoprez@gmail.com',
      pass: process.env.APP_PASSWORD
    }
  });

  let mailOptions = {
    from: 'chanoprez@gmail.com',
    to: email,
    subject: "Link to reset your password",
    text: `Click the following link to visit our website: ${emailURL}`
  };

  console.log("Sending email:", mailOptions);

  try {
    await transporter.sendMail(mailOptions);
    // Send message to frontend telling user to check their email.
    console.log("Sending response:", {message: "An email with a link to reset your password was sent to the email address associated with your account."});
    res.json({message: "An email with a link to reset your password was sent to the email address associated with your account."});
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({message: "Error sending email."});
  }

  
}

const loadResetPasswordPageHandler =  async (req, res) => {
  console.log("Handling redirecting to reset password page request...", req.query);
  const token = req.query.token;
  //Check if token is valid
  console.log("Checking if token is valid...");
  const isValid = checkValidTokenInDatabase(token);
  if(isValid) {
    //Display reset password page.
    console.log("Redirecting to reset password page...");
    res.sendFile(path.join(__dirname, 'private', 'reset.html'), (err) => {
      if (err) {
        console.error("Error loading reset password page:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  }
}

const resetPasswordHandler = async (req, res) => {
  console.log("Handling reset password request...", req.query);
  const newPassword = req.body.newPassword;
  const token = req.body.token;
  console.log("Updating password to:", newPassword, "using token:", token);
  await updatePasswordInDatabase(newPassword, token);
}

const mainPageHandler = async (req, res) => {
  console.log("Handling loading main page request...", req.body);
  res.sendFile(path.join(__dirname, 'public/dist', 'index.html'), (err) => {
    if (err) {
      console.error("Error loading main page:", err);
      res.status(500).send("Internal Server Error");
    }
  });
}


// Chat API Endpoints.

// TODO: Handle "bad gateway" errors
async function createUser(username) {
  const fetch = require('node-fetch');
  const url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL +'/users';
  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify({name: username})
  };


  const userAndKey = await fetch(url, options)
    .then(res => res.json())
    .then(json => {console.log("\nUser:\n", json); return json;})
    .catch(err => console.error('error:' + err));
  return userAndKey
}

async function getUser(userKey) {
  const url = 'https://chat.botpress.cloud/'+ process.env.WEBHOOK_URL +'/users/me';
  const options = {method: 'GET', headers: {accept: 'application/json', 'x-user-key': userKey}};

  const userAndKey = await fetch(url, options)
    .then(res => res.json())
    .then(json => {console.log("\nUser:\n", json); return json;})
    .catch(err => console.error('error:' + err));

  return userAndKey;
}

async function deleteUser(userKey) {
  const url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL + '/users/me';
  const options = {method: 'DELETE', headers: {accept: 'application/json', 'x-user-key': userKey}};

  await fetch(url, options)
    .then(res => res.json())
    .then(json => console.log("\nDeleted User:\n", userKey, "\nResult:\n", json))
    .catch(err => console.error('error:' + err));
}

async function createConvo(userKey) {
  const url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL + '/conversations';
  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json', 'x-user-key': userKey},
    body: JSON.stringify({})
  };

  const convoObj = await fetch(url, options)
    .then(res => res.json())
    .then(json => {console.log("\nCreated Convo:\n", json); return json;})
    .catch(err => console.error('error:' + err));

  return convoObj.conversation
}

async function getConvo(userKey, convoId) {
  const url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL + '/conversations/' + convoId;
  const options = {method: 'GET', headers: {accept: 'application/json', 'x-user-key': userKey}};

  const convoObj = await fetch(url, options)
  .then(res => res.json())
  .then(json => {console.log("\nConvo:\n", json); return json})
  .catch(err => console.error('error:' + err));

  return convoObj.conversation;
}

async function deleteConvo(userKey, convoId) {
  const url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL + '/conversations/' + convoId;
  const options = {method: 'DELETE', headers: {accept: 'application/json', 'x-user-key': userKey}};

  await fetch(url, options)
    .then(res => res.json())
    .then(json => console.log("\nDeleted Convo:\n", convoId, "\nResult:\n", json))
    .catch(err => console.error('error:' + err));
}

// TODO: Check if next tokens work properly.
async function listConvos(userKey) {
  let url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL + '/conversations';
  const options = {method: 'GET', headers: {accept: 'application/json', 'x-user-key': userKey}};
  let conversations = [];
  // Initial fetch request.
  let convosObj = await fetch(url, options)
    .then(res => res.json())
    .then(json => {console.log("CONVOS:", json); return json;})
    .catch(err => console.error('error:' + err));

  conversations = [...convosObj.conversations];
  // Fetch additional pages of conversations, if any.
  while ("nextToken" in convosObj.meta) { // If there is a next token, continue fetching
    url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL + '/conversations?nextToken=' + convosObj.meta.nextToken;
    convosObj = await fetch(url, options)
      .then(res => res.json())
      .then(json => {console.log("CONVOS:", json); return json;})
      .catch(err => console.error('error:' + err));
    conversations = [...conversations, convosObj.conversations];
  }

  return conversations;
}

async function sendMessage(userKey, convoId, text)  {
  const url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL + '/messages';
  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json', 'x-user-key': userKey},
    body: JSON.stringify({payload: {text: text, type: 'text'}, conversationId: convoId})
  };

  const messageObj = await fetch(url, options)
    .then(res => res.json())
    .then(json => {console.log("\nSent Message:\n", json); return json;})
    .catch(err => console.error('error:' + err));

  return messageObj.message;
}

async function listMessages(userKey, convoId) {
  let url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL + '/conversations/' + convoId + '/messages';
  const options = {method: 'GET', headers: {accept: 'application/json', 'x-user-key': userKey}};
  let messages = [];
  // Initial fetch request.
  let messagesObj = await fetch(url, options)
    .then(res => res.json())
    .then(json => {return json})
    .catch(err => console.error('error:' + err));

  messages = [...messagesObj.messages];
  // Fetch additional pages of conversations, if any.
  while ("nextToken" in messagesObj.meta) {// If there is a next token, continue fetching.
    let url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL + '/conversations/' + convoId + '/messages?nextToken=' + convosObj.meta.nextToken;
    messagesObj = await fetch(url, options)
    .then(res => res.json())
    .then(json => {return json})
    .catch(err => console.error('error:' + err));
    messages = [...messages, messagesObj.messages];
  }
  return messages;
}

async function listenToConvo(userKey, convoId) {
  const url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL + '/conversations/' + convoId + '/listen';
  const options = {method: 'GET', headers: {accept: 'application/json', 'x-user-key': userKey}};

  const stream = await fetch(url, options)
    .then(res => res.body)
    .catch(err => console.error('error:' + err));
  console.log(stream);
}

async function listParticipants(userKey, convoId) {
  const url = 'https://chat.botpress.cloud/' + process.env.WEBHOOK_URL + '/conversations/' + convoId + '/participants';
  const options = {method: 'GET', headers: {accept: 'application/json', 'x-user-key': userKey}};

  fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error('error:' + err));
}

// Your routes here
port = process.env.PORT || 3000;

app.listen(3000, () => {
  console.log('Server is running on port 5000');
});

app.post("/convo", chatHandler);
app.delete("/convo", deleteConvoHandler);

app.post("/user/login", loginHandler);
app.post("/user/signUp", signUpHandler);

app.post("/user/requestPasswordReset", requestPasswordResetHandler);
app.get("/user/loadResetPasswordPage", loadResetPasswordPageHandler);
app.post("/user/resetPassword", resetPasswordHandler);

app.delete("/user", deleteUserHandler);

app.get("/", mainPageHandler)



