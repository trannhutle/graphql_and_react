import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
const chats = [
  {
    id: "1",
    users: [
      {
        id: 1,
        avatar: "/uploads/avatar1.png",
        username: "Test user",
      },
      {
        id: 2,
        avatar: "/uploads/avatar2.png",
        username: "Test user 2",
      },
    ],
  },
];
const GET_CHATS = gql`
  {
    chats {
      id
      users {
        id
        avatar
        username
      }
      lastMessage {
        text
      }
    }
  }
`;
const GET_CHAT = gql`
  query chat($chatId: Int!) {
    chat(chatId: $chatId) {
      id
      users {
        id
        avatar
        username
      }
      messages {
        id
        text
        user {
          id
        }
      }
    }
  }
`;

export default class Chats extends Component {
  state = { openChats: [] };

  usernamesToString = (users) => {
    const userList = users.slice(1);
    var usernameString = "";
    for (var i = 0; i < userList.length; i++) {
      usernameString += userList[i].username;
      if (i - 1 === userList.length) {
        usernameString += ", ";
      }
    }
    return usernameString;
  };
  shorten = (text) => {
    if (text.length > 12) {
      return text.substring(0, text.length - 9) + "...";
    }
    return text;
  };

  openChat = (id) => {
    var openChats = this.state.openChats.slice();
    if (openChats.indexOf(id) === -1) {
      if (openChats.length > 2) {
        openChats = openChats.slice(1);
      }
      openChats.push(id);
    }

    this.setState({ openChats });
  };

  render() {
    const self = this;
    const { openChats, textInputs } = this.state;

    return (
      <div className="wrapper">
        <div className="chats">
          <Query query={GET_CHATS}>
            {({ loading, error, data }) => {
              if (loading) return <p>Loading...</p>;
              if (error) return error.message;

              const { chats } = data;

              return chats.map((chat, i) => (
                <div
                  key={"chat" + chat.id}
                  className="chat"
                  onClick={() => this.openChat(chat.id)}
                >
                  <div className="header">
                    <img
                      src={
                        chat.users.length > 2
                          ? "/public/group.png"
                          : chat.users[1].avatar
                      }
                    />
                    <div>
                      <h2>
                        {this.shorten(this.usernamesToString(chat.users))}
                      </h2>
                      <span>
                        {chat.lastMessage &&
                          this.shorten(chat.lastMessage.text)}
                      </span>
                    </div>
                  </div>
                </div>
              ));
            }}
          </Query>
        </div>
        <div className="openChats">
          <pre>{JSON.stringify(openChats, null, 2)}</pre>

          {openChats.map((chatId, i) => (
            <Query
              key={"chatWindow" + chatId}
              query={GET_CHAT}
              variables={{ chatId }}
            >
              {({ loading, error, data }) => {
                if (loading) return <p>Loading...</p>;
                if (error) return error.messagge;

                const { chat } = data;
                return (
                  <div className="chatWindow">
                    <div className="header">
                      <span> {chat.users[1].username}</span>
                      <button className="close"> X</button>
                    </div>
                    <div className="messages">
                      {chat.messages.map((messagge, j) => (
                        <div
                          key={"message" + messagge.id}
                          className={
                            "message " +
                            (messagge.user.id > 1 ? "left" : "right")
                          }
                        >
                          {messagge.text}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            </Query>
          ))}
        </div>
      </div>
    );
  }
}
