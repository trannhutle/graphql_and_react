const resolvers = {
  RootQuery: {
    posts(root, args, context) {
      return [];
    },
  },
  RootMutation: {
    addPost(root, { post, user }, context) {
      const postObject = {
        ...post,
        user,
        id: posts.length + 1,
      };
      posts.push(postObject);
      return postObject;
    },
  },
};
export default resolvers;
