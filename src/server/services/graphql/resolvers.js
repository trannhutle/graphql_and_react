import logger from "../../helpers/logger";

export default function resolver() {
  const { db } = this;
  const { Post, User, Chat, Message } = db.models;

  const resolvers = {
    Post: {
      user(post, args, context) {
        return post.getUser();
      },
    },
    Message: {
      user(message, args, context) {
        return message.getUser();
      },
      chat(message, args, context) {
        return message.getChat();
      },
    },
    Chat: {
      messages(chat, args, context) {
        return chat.getMessages({ order: [["id", "ASC"]] });
      },
      users(chat, args, context) {
        return chat.getUsers();
      },
      lastMessage(chat, args, context) {
        return chat
          .getMessages({ limit: 1, order: [["id", "DESC"]] })
          .then((message) => {
            // logger({ level: "info", message: message });
            console.log(message);
            return message[0];
          });
      },
    },
    RootQuery: {
      posts(root, args, context) {
        return Post.findAll({ order: [["createdAt", "DESC"]] });
      },
      chats(root, args, context) {
        return User.findAll().then((users) => {
          if (!users.length) {
            return [];
          }
          const userRow = users[0];

          return Chat.findAll({
            /*include: run a MySQL JOIN
            Setting the include statement to required runs an INNER JOIN and not a LEFT OUTER JOIN, by default.
            Any chat that does not match the condition in the through property is excluded. 
            In our example, the condition is that the user ID has to match. */
            include: [
              {
                model: User,
                required: true,
                through: { where: { userId: userRow.id } },
              },
              {
                model: Message,
              },
            ],
          });
        });
      },
      chat(root, { chatId }, context) {
        return Chat.findByPk(chatId, {
          include: [
            {
              model: User,
              required: true,
            },
            {
              model: Message,
            },
          ],
        });
      },
    },
    RootMutation: {
      addPost(root, { post, user }, context) {
        logger.info({ level: "info", message: "Post was created" });
        return User.findAll().then((users) => {
          const userRow = users[0];
          return Post.create({
            ...post,
          }).then((newPost) => {
            return Promise.all([newPost.setUser(userRow.id)]).then(() => {
              return newPost;
            });
          });
        });
      },
      addChat(root, { chat }, context) {
        logger.log({
          level: "info",
          message: "Message was created",
        });
        return Chat.create().then((newChat) => {
          /* Sequelize added the setUsers function to the chat model instance. 
          It was added because of the associations using the belongsToMany method in the chat model.
          There, we can directly provide an array of user IDs that should be associated with the new chat,
           through the users_chats table. */
          return Promise.all([newChat.setUsers(chat.users)]).then(() => {
            return newChat;
          });
        });
      },
      addMessage(root, { message }, context) {
        logger.log({
          level: "info",
          message: "Message was created",
        });

        return User.findAll().then((users) => {
          const usersRow = users[0];

          return Message.create({
            ...message,
          }).then((newMessage) => {
            return Promise.all([
              newMessage.setUser(usersRow.id),
              newMessage.setChat(message.chatId),
            ]).then(() => {
              return newMessage;
            });
          });
        });
      },
    },
  };
  return resolvers;
}
