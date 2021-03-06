const typeDefinitions = `
    type PostFeed{
        posts: [Post]
    }    

    type User{
        id: Int
        avatar: String
        username:String
    }
    type Post{
        id: Int
        text: String
        user: User
    }
    type Message {
        id: Int
        text: String
        chat: Chat
        user: User
    } 
      
    type Chat {
        id: Int
        messages: [Message]
        users: [User]
        lastMessage:Message
    }

    input MessageInput {
        text: String!
        chatId: Int!
    }

    input ChatInput {
        users: [Int]
    }

    input PostInput {
        text: String!
    }

    input UserInput {
        username: String!
        avatar: String!
    }
      
    type RootMutation {
        addPost (
            post: PostInput!
        ): Post
        
        addChat (
            chat: ChatInput!
        ): Chat

        addMessage (
            message: MessageInput!
        ): Message
    }

    type RootQuery{
        posts:[Post]
        chats: [Chat]
        chat(chatId: Int): Chat
        postsFeed(page:Int, limit: Int): PostFeed
    }
    schema{
        query:RootQuery
        mutation: RootMutation
    }
`;
export default [typeDefinitions];
