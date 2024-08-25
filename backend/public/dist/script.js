import React from "https://esm.sh/react@18.3.1";
import ReactDOM from "https://esm.sh/react-dom@18.3.1";
import { CSSTransition } from "https://esm.sh/react-transition-group";


async function sendMessage(message, userKey, convoId) {
  // Package message.
  const jsonReq = { message: message, userKey: userKey, convoId: convoId };
  // Fetch post request.
  const logObj = await fetch('http://localhost:3000/convo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' },

    body: JSON.stringify(jsonReq) }).
  then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  }).
  then(data => {console.log("Fetched Data", data);return data;});

  return logObj;
}

async function deleteConvo(userKey, convoId) {
  // Package message.
  const jsonReq = { userKey: userKey, convoId: convoId };
  const logObj = await fetch('http://localhost:3000/convo', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json' },

    body: JSON.stringify(jsonReq) }).
  then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  }).
  then(data => {console.log("Deleted user and convo", data);});

}

async function login(username, password) {
  const jsonReq = { username: username, password: password };
  const logObj = await fetch('http://localhost:3000/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' },

    body: JSON.stringify(jsonReq) }).
  then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  }).
  then(data => {console.log("Logged In");return data;});


  return logObj;
}

async function signUp(username, email, password) {
  const jsonReq = { username: username, email: email, password: password };
  const logObj = await fetch('http://localhost:3000/user/signUp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' },

    body: JSON.stringify(jsonReq) }).
  then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  }).
  then(data => {console.log("Logged In");return data;});


  return logObj;
}

async function deleteAccount(userKey) {
  const jsonReq = { userKey: userKey };
  const logObj = await fetch('http://localhost:3000/user', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json' },

    body: JSON.stringify(jsonReq) }).
  then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  }).
  then(data => {console.log("Deleted user and convo", data);});

}

async function emailResetPasswordLink(usernameOrEmail) {
  const jsonReq = { usernameOrEmail: usernameOrEmail };
  const logObj = await fetch('http://localhost:3000/user/requestPasswordReset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' },

    body: JSON.stringify(jsonReq) }).
  then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  }).
  then(data => {console.log("Logged In");return data;});


  return logObj;
}

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(event) {
    //Send them to the corresponding page via the idx.
    const tabIndex = event.target.tabIndex;
    console.log(event.target.innerText);
    this.props.onClick(tabIndex);
  }

  render() {
    const navSections = this.props.navs.map((section, index) => {
      return /*#__PURE__*/(
        React.createElement("li", { key: index }, /*#__PURE__*/
        React.createElement("a", { onClick: this.onClick,
          tabIndex: section.pageIdx },
        section.label)));


    });

    return /*#__PURE__*/(
      React.createElement("div", { id: "navbar" }, /*#__PURE__*/
      React.createElement("h1", null, "mAInuscript"), /*#__PURE__*/
      React.createElement("nav", null, /*#__PURE__*/
      React.createElement("ul", { id: "nav-sections" },
      navSections))));




  }}


class InitialView extends React.Component {
  constructor(props) {
    super(props);
    this.onStart = this.onStart.bind(this);
  }

  onStart() {
    this.props.onStart(1);
  }

  render() {
    return /*#__PURE__*/(
      React.createElement("div", { id: "initialView" }, /*#__PURE__*/
      React.createElement("button", { id: "start-btn",
        onClick: this.onStart }, "Start")));




  }}


class LoadingIcon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", { class: "lds-ellipsis" }, /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("div", null));
  }}


class ChatUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      promptText: "",
      echoText: "",
      buttonDisabled: false,
      echoHeight: "auto" };

    // Handles clicking the post button.
    this.onSend = this.onSend.bind(this);
    // Handles clicking the delete button.
    this.onDelete = this.onDelete.bind(this);
    // handles input to the prompt area.
    this.onInput = this.onInput.bind(this);
    // Used for referencing messages area.
    this.echoRef = React.createRef();
    // Dynamically resizes the messages area.
    this.adjustHeight = this.adjustHeight.bind(this);
  }

  adjustHeight() {
    console.log("Adjusting height");
    // Update the height of the echo area via the state to be the scroll height.
    this.setState(() => {
      const textarea = this.echoRef.current;
      if (textarea.scrollHeight <= 500) {
        return { echoHeight: textarea.scrollHeight + 'px' };
      }
    });

  }

  onSend() {
    console.log("Send Clicked");
    const message = this.state.promptText;
    // Disable button whilst log is being fetched and clear the prompt.
    this.setState(() => {return { buttonDisabled: true, promptText: "" };}, () => {
      sendMessage(message, this.props.currentUserKey, this.props.currentConvoId) // Post the message.
      .then(json => {// Once the message is fetched 
        // Update the main's state.
        const echoText = json["log"].map(messageObj => {return messageObj["payload"]["title"] + "\n\n" + messageObj["payload"]["subtitle"];}).reverse().join("\n\n");
        const currentConvoId = json["log"][0]["conversationId"];
        const backgroundUrl = `url(${json["log"][0]["payload"]["imageUrl"]})`;

        this.setState(() => {return { buttonDisabled: false, echoText: echoText };}, () => {
          // Adjust the height after the prompt is updated.
          this.adjustHeight();
        });
        //Update background image.
        this.props.throwBackgroundUrl(backgroundUrl);
        this.props.throwConvoId(currentConvoId);
        if ("intros" in json) {
          console.log("THROWN GALLERY");
          this.props.throwGallery(json["intros"]);
        }
      }).catch(error => {
        alert('Something went wrong. Please try again.');
        this.setState(() => {return { buttonDisabled: false };});
      });
    });
  }

  onDelete() {
    console.log("Delete clicked");
    // Disable buttons.
    this.setState(() => {return { buttonDisabled: true };}, () => {
      // Delete conversation.
      const userKey = this.props.currentUserKey;
      const convoId = this.props.currentConvoId;
      console.log(userKey);
      //Return to original state upon delete.
      deleteConvo(userKey, convoId).then(this.setState(() => {
        return { promptText: "",
          echoText: "Tip: Stories made while not signed in cannot be saved!",
          buttonDisabled: false,
          echoHeight: "auto" };
      })).catch(error => {
        alert('Something went wrong. Please try again.');
        this.setState(() => {return { buttonDisabled: false };});
      });
    });
  }

  onInput(event) {
    // Update the state of the promptText on input.
    this.setState(() => {return { promptText: event.target.value };});
  }

  componentDidMount() {
    //Load conversation
    const userKey = this.props.currentUserKey;
    const convoId = this.props.currentConvoId;
    // If a previous conversation was selected via the gallery.
    if (convoId) {
      console.log("ConvoId", convoId);
      console.log("UserKey:", userKey);
      //Disable button an empty prompt text first just in case.
      this.setState(() => {return { buttonDisabled: true, promptText: "" };}, () => {
        //Sending an empty message will just list the messages of the convoId.
        sendMessage("", userKey, convoId).then(logObj => {
          const echoText = logObj["log"].map(messageObj => {return messageObj["payload"]["title"] + "\n\n" + messageObj["payload"]["subtitle"];}).reverse().join("\n\n");
          const backgroundUrl = `url(${logObj["log"][0]["payload"]["imageUrl"]})`;
          this.setState(() => {return { echoText: echoText, buttonDisabled: false };}, () => {this.adjustHeight();});
          //Update background image.
          this.props.throwBackgroundUrl(backgroundUrl);
        }).catch(error => {
          alert('Something went wrong. Please try again.');
          this.setState(() => {return { buttonDisabled: false };});
        });
      });
    }
  }

  render() {
    return /*#__PURE__*/(
      React.createElement("div", { id: "chatUI" }, /*#__PURE__*/
      React.createElement("textarea", { id: "messages",
        value: this.state.echoText,
        style: { height: this.state.echoHeight },
        placeholder: "Tip: Stories made while not signed in cannot be saved!",
        ref: this.echoRef }),
      this.state.buttonDisabled && /*#__PURE__*/React.createElement(LoadingIcon, null), /*#__PURE__*/
      React.createElement("div", { id: "inputs" }, /*#__PURE__*/
      React.createElement("textarea", { id: "messageInput",
        placeholder: "Build your story...",
        onInput: this.onInput,
        value: this.state.promptText }), /*#__PURE__*/
      React.createElement("button", { if: "generate-btn",
        onClick: this.onSend,
        disabled: this.state.buttonDisabled }, /*#__PURE__*/
      React.createElement("i", { class: "bi bi-pencil-fill" })), /*#__PURE__*/

      React.createElement("button", { id: "delete-btn",
        onClick: this.onDelete,
        disabled: this.state.buttonDisabled }, /*#__PURE__*/
      React.createElement("i", { class: "bi bi-trash3-fill" })))));




  }}


class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitDisabled: false };

    this.onLogin = this.onLogin.bind(this);
    this.onCreateAccount = this.onCreateAccount.bind(this);
    this.onForgotPassword = this.onForgotPassword.bind(this);
  }

  onLogin(event) {
    console.log("Submit pressed");
    event.preventDefault();
    // Disable submit button whilst login is being processed
    this.setState(() => {return { submitDisabled: true };}, () => {
      const username = event.target.username.value;
      const password = event.target.password.value;
      login(username, password).then(json => {
        // Send userKey to main.
        if (json["userKey"]) {
          this.props.throwUserKey(json["userKey"]);
          if ("intros" in json && json["intros"].length) {
            this.props.throwGallery(json["intros"]);
            this.props.loadPage(2);
          } else {
            this.props.loadPage(1);
          }
          const navs = [
          { label: "Home", pageIdx: 0 },
          { label: "Chat", pageIdx: 1 },
          { label: "Stories", pageIdx: 2 },
          { label: "Logout", pageIdx: 4 }];

          this.props.throwNavs(navs);
        } else {
          alert("User not found or password invalid");
        }

        this.setState(() => {return { submitDisabled: false };});
      }).catch(error => {
        alert('Something went wrong. Please try again.');
        this.setState(() => {return { submitDisabled: false };});
      });
    });

  }

  onCreateAccount() {
    this.props.loadPage(5);
  }

  onForgotPassword() {
    this.props.loadPage(7);
  }

  render() {
    return /*#__PURE__*/(
      React.createElement("div", { class: "loginSignUp" }, /*#__PURE__*/
      React.createElement("h2", null, "Login"), /*#__PURE__*/
      React.createElement("form", { onSubmit: this.onLogin }, /*#__PURE__*/
      React.createElement("label", { for: "username" }, "Enter your username:"), /*#__PURE__*/
      React.createElement("input", { input: true, type: "text", id: "username", name: "username", required: true }), /*#__PURE__*/
      React.createElement("label", { for: "password" }, "Enter your password:"), /*#__PURE__*/
      React.createElement("input", { input: true, type: "password", id: "password", name: "password", required: true }),
      this.state.submitDisabled ? /*#__PURE__*/React.createElement(LoadingIcon, null) : /*#__PURE__*/React.createElement("input", { type: "submit", value: "Sign In", disabled: this.state.submitDisabled }), /*#__PURE__*/
      React.createElement("a", { onClick: this.onCreateAccount }, "Create an mAInuscript account"), /*#__PURE__*/
      React.createElement("a", { onClick: this.onForgotPassword }, "Forgot password?"))));



  }}


class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitDisabled: false };

    this.onSignUp = this.onSignUp.bind(this);
  }

  onSignUp() {
    console.log("Submit pressed");
    event.preventDefault();
    // Disable submit button whilst login is being processed
    this.setState(() => {return { submitDisabled: true };}, () => {
      const username = event.target.username.value;
      const email = event.target.email.value;
      const password = event.target.password.value;
      signUp(username, email, password).then(json => {
        if ("message" in json) {
          alert(json["message"]);
        } else if ("userKey" in json) {
          const navs = [
          { label: "Home", pageIdx: 0 },
          { label: "Chat", pageIdx: 1 },
          { label: "Stories", pageIdx: 2 },
          { label: "Logout", pageIdx: 4 }];

          this.props.throwUserKey(json["userKey"]);
          this.props.throwNavs(navs);
        }
        this.setState(() => {return { submitDisabled: false };});
      }).catch(error => {
        alert('Something went wrong. Please try again.');
        this.setState(() => {return { submitDisabled: false };});
      });
    });
  }

  render() {
    return /*#__PURE__*/(
      React.createElement("div", { class: "loginSignUp" }, /*#__PURE__*/
      React.createElement("h2", null, "Sign Up"), /*#__PURE__*/
      React.createElement("form", { onSubmit: this.onSignUp }, /*#__PURE__*/
      React.createElement("label", { for: "username" }, "Enter your username:"), /*#__PURE__*/
      React.createElement("input", { input: true, type: "text", id: "username", name: "username", required: true }), /*#__PURE__*/
      React.createElement("label", { for: "email" }, "Enter your email:"), /*#__PURE__*/
      React.createElement("input", { input: true, type: "email", id: "email", name: "email", required: true }), /*#__PURE__*/
      React.createElement("label", { for: "password" }, "Enter your password:"), /*#__PURE__*/
      React.createElement("input", { input: true, type: "password", id: "password", name: "password", required: true }),
      this.state.submitDisabled ? /*#__PURE__*/React.createElement(LoadingIcon, null) : /*#__PURE__*/React.createElement("input", { type: "submit", value: "Create Account", disabled: this.state.submitDisabled }))));



  }}


class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitDisabled: false,
      displayText: "Enter your email address or username and we’ll send you a link to reset your password:" };

    this.onForgotPassword = this.onForgotPassword.bind(this);
  }

  onForgotPassword(event) {
    console.log("Submit pressed");
    event.preventDefault();
    // Disable submit button.
    this.setState(() => {return { submitDisabled: true };}, () => {
      const usernameOrEmail = event.target.usernameOrEmail.value;
      console.log(usernameOrEmail);
      emailResetPasswordLink(usernameOrEmail).then(json => {
        console.log(json["message"]);
        this.setState(() => {return { displayText: json["message"], submitDisabled: false };});
      }).catch(error => {
        alert('Something went wrong. Please try again.');
        this.setState(() => {return { submitDisabled: false };});
      });
    });
  }

  render() {
    return /*#__PURE__*/(
      React.createElement("div", { class: "loginSignUp" }, /*#__PURE__*/
      React.createElement("h2", null, "Reset your password"), /*#__PURE__*/
      React.createElement("form", { onSubmit: this.onForgotPassword }, /*#__PURE__*/
      React.createElement("label", { for: "username" }, this.state.displayText), /*#__PURE__*/
      React.createElement("input", { input: true, type: "text", id: "username", name: "usernameOrEmail", required: true }),
      this.state.submitDisabled ? /*#__PURE__*/React.createElement(LoadingIcon, null) : /*#__PURE__*/React.createElement("input", { type: "submit", value: "Reset Password", disabled: this.state.submitDisabled }))));



  }}


class Logout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitDisabled: false };

    this.onLogOut = this.onLogOut.bind(this);
    this.onDeleteAccount = this.onDeleteAccount.bind(this);
  }

  onLogOut(event) {
    console.log("Logging out.");
    event.preventDefault();
    this.props.loadPage(0);
    this.props.throwNavs(defaultNavs);
    this.props.throwGallery(defaultGallery);
    this.props.throwUserKey("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMDFKNTQ3U01HU0YwM0dCVjBRUTdYQ0RHWVEiLCJpYXQiOjE3MjM0OTgwMjV9.9mgky1Wb35jMnEwVOoNnGRW1P5sMnnxXDULBcCtk8Eo");
    this.props.throwConvoId("");
    this.props.throwBackgroundUrl('url(https://preview.redd.it/0skmx6yuddw21.jpg?auto=webp&s=6387a5516a404d0879784f917815b8a910c8a25c)');
  }

  onDeleteAccount() {
    this.props.loadPage(6);
  }

  render() {
    return /*#__PURE__*/(
      React.createElement("div", { class: "loginSignUp" }, /*#__PURE__*/
      React.createElement("h2", null, "Are you sure?"), /*#__PURE__*/
      React.createElement("form", { onSubmit: this.onLogOut },
      this.state.submitDisabled ? /*#__PURE__*/React.createElement(LoadingIcon, null) : /*#__PURE__*/React.createElement("input", { type: "submit", value: "Logout", disabled: this.state.submitDisabled }), /*#__PURE__*/
      React.createElement("a", { onClick: this.onDeleteAccount }, "Delete account"))));



  }}


class DeleteAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitDisabled: false };

    this.onDeleteAccount = this.onDeleteAccount.bind(this);
  }


  onDeleteAccount() {
    console.log("Submit pressed");
    event.preventDefault();
    // Disable submit button whilst delete is being processed
    this.setState(() => {return { submitDisabled: true };}, () => {
      const userKey = this.props.currentUserKey;
      deleteAccount(userKey).then(json => {
        this.props.loadPage(0);
        this.props.throwNavs(defaultNavs);
        this.props.throwGallery(defaultGallery);this.props.throwUserKey("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMDFKNTQ3U01HU0YwM0dCVjBRUTdYQ0RHWVEiLCJpYXQiOjE3MjM0OTgwMjV9.9mgky1Wb35jMnEwVOoNnGRW1P5sMnnxXDULBcCtk8Eo");
        this.props.throwConvoId("");
        this.setState(() => {return { submitDisabled: false };});
      }).catch(error => {
        alert('Something went wrong. Please try again.');
        this.setState(() => {return { submitDisabled: false };});
      });
    });
  }

  render() {
    return /*#__PURE__*/(
      React.createElement("div", { class: "loginSignUp" }, /*#__PURE__*/
      React.createElement("h2", null, "Are you sure?"), /*#__PURE__*/
      React.createElement("form", { onSubmit: this.onDeleteAccount },
      this.state.submitDisabled ? /*#__PURE__*/React.createElement(LoadingIcon, null) : /*#__PURE__*/React.createElement("input", { type: "submit", value: "Delete Account", disabled: this.state.submitDisabled }))));



  }}


class Library extends React.Component {
  constructor(props) {
    super(props);
    this.loadConvo = this.loadConvo.bind(this);
    this.onArrow = this.onArrow.bind(this);
  }

  loadConvo(event) {
    const convoId = event.currentTarget.name;
    if (!convoId) {
      alert("Log in and build your own story first!");
    } else {
      this.props.throwConvoId(convoId);
      this.props.loadPage(1);
    }
  }

  onArrow(event) {
    const direction = event.currentTarget.name;

    const slider = document.querySelector('.slider');
    const items = document.querySelectorAll('.item');
    direction === 'next' && slider.append(items[0]);
    direction === 'prev' && slider.prepend(items[items.length - 1]);
  }

  render() {
    let panels = this.props.stories.filter(Boolean).map(entry => {
      const imageUrl = `url(${entry["payload"]["imageUrl"]})`;
      const title = entry["payload"]["title"];
      const subtitle = entry["payload"]["subtitle"];
      const convoId = entry["conversationId"];
      return /*#__PURE__*/(
        React.createElement("li", { class: "item", style: { backgroundImage: imageUrl } }, /*#__PURE__*/
        React.createElement("div", { class: "content" }, /*#__PURE__*/
        React.createElement("h2", { class: "title" }, title), /*#__PURE__*/
        React.createElement("p", { class: "description" }, subtitle), /*#__PURE__*/
        React.createElement("button", { onClick: this.loadConvo, name: convoId }, "Continue Story"))));

    });
    if (panels.length === 1) {
      panels = [...panels, ...panels];
    }
    return /*#__PURE__*/(
      React.createElement("div", { id: "stories" }, /*#__PURE__*/
      React.createElement("ul", { class: "slider" },
      panels), /*#__PURE__*/

      React.createElement("nav", { class: "nav" }, /*#__PURE__*/
      React.createElement("button", { class: "btn prev", name: "prev", onClick: this.onArrow }, /*#__PURE__*/React.createElement("i", { class: "bi bi-arrow-left-short" })), /*#__PURE__*/
      React.createElement("button", { class: "btn next", name: "next", onClick: this.onArrow }, /*#__PURE__*/React.createElement("i", { class: "bi bi-arrow-right-short" })))));


  }}


class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIdx: 0,
      backgroundUrl: 'url(https://preview.redd.it/0skmx6yuddw21.jpg?auto=webp&s=6387a5516a404d0879784f917815b8a910c8a25c)',
      currentUserKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMDFKNTQ3U01HU0YwM0dCVjBRUTdYQ0RHWVEiLCJpYXQiOjE3MjM0OTgwMjV9.9mgky1Wb35jMnEwVOoNnGRW1P5sMnnxXDULBcCtk8Eo',
      gallery: defaultGallery,
      currentConvoId: '',
      navs: defaultNavs };

    this.setBackgroundUrl = this.setBackgroundUrl.bind(this);
    this.loadPage = this.loadPage.bind(this);
    this.setUserKey = this.setUserKey.bind(this);
    this.setGallery = this.setGallery.bind(this);
    this.setConvoId = this.setConvoId.bind(this);
    this.setNavs = this.setNavs.bind(this);
  }

  loadPage(pageIdx) {
    this.setState(prevState => {return { pageIdx: pageIdx };});
  }

  setBackgroundUrl(url) {
    this.setState(() => {
      return { backgroundUrl: url };
    });
  }

  setUserKey(userKey) {
    this.setState(prevState => {
      return { currentUserKey: userKey };
    }, () => {console.log(this.state.currentUserKey);});
  }

  setGallery(intros) {
    this.setState(() => {
      return { gallery: intros };
    });
  }

  setConvoId(convoId) {
    this.setState(prevState => {
      return { currentConvoId: convoId };
    });
  }

  setNavs(navs) {
    this.setState(() => {
      return { navs: navs };
    });
  }

  render() {
    return /*#__PURE__*/(
      React.createElement("div", { id: "main",
        class: "container-fluid",
        style: { backgroundImage: this.state.backgroundUrl } }, /*#__PURE__*/
      React.createElement(Navbar, { navs: this.state.navs, onClick: this.loadPage }), /*#__PURE__*/
      React.createElement(CSSTransition, {
        in: this.state.pageIdx === 0,
        timeout: 300,
        classNames: "generic",
        unmountOnExit: true }, /*#__PURE__*/

      React.createElement(InitialView, { onStart: this.loadPage })), /*#__PURE__*/

      React.createElement(CSSTransition, {
        in: this.state.pageIdx === 1,
        timeout: 300,
        classNames: "generic",
        unmountOnExit: true }, /*#__PURE__*/

      React.createElement(ChatUI, { throwBackgroundUrl: this.setBackgroundUrl, currentUserKey: this.state.currentUserKey, currentConvoId: this.state.currentConvoId, throwConvoId: this.setConvoId, throwGallery: this.setGallery })), /*#__PURE__*/

      React.createElement(CSSTransition, {
        in: this.state.pageIdx === 2,
        timeout: 300,
        classNames: "generic",
        unmountOnExit: true }, /*#__PURE__*/

      React.createElement(Library, { stories: this.state.gallery, throwConvoId: this.setConvoId, loadPage: this.loadPage })), /*#__PURE__*/

      React.createElement(CSSTransition, {
        in: this.state.pageIdx === 3,
        timeout: 300,
        classNames: "generic",
        unmountOnExit: true }, /*#__PURE__*/

      React.createElement(Login, { throwUserKey: this.setUserKey, throwGallery: this.setGallery, throwNavs: this.setNavs, loadPage: this.loadPage })), /*#__PURE__*/

      React.createElement(CSSTransition, {
        in: this.state.pageIdx === 4,
        timeout: 300,
        classNames: "generic",
        unmountOnExit: true }, /*#__PURE__*/

      React.createElement(Logout, { throwUserKey: this.setUserKey, throwGallery: this.setGallery, throwNavs: this.setNavs, loadPage: this.loadPage, throwConvoId: this.setConvoId, throwBackgroundUrl: this.setBackgroundUrl })), /*#__PURE__*/

      React.createElement(CSSTransition, {
        in: this.state.pageIdx === 5,
        timeout: 300,
        classNames: "generic",
        unmountOnExit: true }, /*#__PURE__*/

      React.createElement(SignUp, { throwUserKey: this.setUserKey, loadPage: this.loadPage, throwNavs: this.setNavs })), /*#__PURE__*/

      React.createElement(CSSTransition, {
        in: this.state.pageIdx === 6,
        timeout: 300,
        classNames: "generic",
        unmountOnExit: true }, /*#__PURE__*/

      React.createElement(DeleteAccount, { throwUserKey: this.setUserKey, throwGallery: this.setGallery, throwNavs: this.setNavs, loadPage: this.loadPage, throwConvoId: this.setConvoId, currentUserKey: this.state.currentUserKey })), /*#__PURE__*/

      React.createElement(CSSTransition, {
        in: this.state.pageIdx === 7,
        timeout: 300,
        classNames: "generic",
        unmountOnExit: true }, /*#__PURE__*/

      React.createElement(ForgotPassword, null))));



  }}


const defaultGallery = [
{ 'conversationId': "",
  'payload':
  { 'imageUrl': 'https://i.redd.it/tc0aqpv92pn21.jpg',
    'title': "Estrange Bond",
    'subtitle': 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.' } },


{ 'conversationId': "",
  'payload':
  { 'imageUrl': 'https://cdn.mos.cms.futurecdn.net/dP3N4qnEZ4tCTCLq59iysd.jpg',
    'title': "Lossless Youths",
    'subtitle': 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.' } },


{ 'conversationId': "",
  'payload':
  { 'imageUrl': 'https://wharferj.files.wordpress.com/2015/11/bio_north.jpg',
    'title': "The Gate Keeper",
    'subtitle': 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.' } },


{ 'conversationId': "",
  'payload':
  { 'imageUrl': 'https://images7.alphacoders.com/878/878663.jpg',
    'title': "Last Trace Of Us",
    'subtitle': 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.' } },


{ 'conversationId': "",
  'payload':
  { 'imageUrl': 'https://theawesomer.com/photos/2017/07/simon_stalenhag_the_electric_state_6.jpg',
    'title': "Urban Decay",
    'subtitle': 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.' } },


{ 'conversationId': "",
  'payload':
  { 'imageUrl': 'https://da.se/app/uploads/2015/09/simon-december1994.jpg',
    'title': "The Migration",
    'subtitle': 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga voluptatum, iure corporis inventore praesentium nisi. Id laboriosam ipsam enim.' } }];




const defaultNavs = [
{ label: "Home", pageIdx: 0 },
{ label: "Chat", pageIdx: 1 },
{ label: "Stories", pageIdx: 2 },
{ label: "Login", pageIdx: 3 }];


ReactDOM.render( /*#__PURE__*/React.createElement(Main, null), document.querySelector("body"));