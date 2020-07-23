import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

const GET_POSTS = gql`
  query postsFeed($page: Int, $limit: Int) {
    postsFeed(page: $page, limit: $limit) {
      posts {
        id
        text
        user {
          avatar
          username
        }
      }
    }
  }
`;

export default class AddPostMutation extends Component {
  state = {
    postContent: "",
  };
  changePostContent = (value) => {
    this.setState({ postContent: value });
  };
  render() {
    const self = this;
    const { children, variables } = this.props;
    const { postContent } = this.state;

    return (
      <Mutation
        update={(store, { data: { addPost } }) => {
          var query = {
            query: GET_POSTS,
          };
          if (typeof variables !== typeof undefined) {
            query.variables = variables;
          }
          /* It reads the data, which has been saved for this specific query inside of the cache.
                    The data variable holds all of the posts that we have in our feed. */
          const data = store.readQuery(query);
          /* Now that we have all of the posts in an array, we can add the missing post. 
                    Make sure that you know whether you need to prepend or append an item. 
                    In our example, we want to insert a post at the top of our list, so we need to prepend it.
                    You can use the unshift JavaScript function to do this. 
                    We just set our addPost as the first item of the data.posts array. */
          data.postsFeed.posts.unshift(addPost);
          /* . The store.writeQuery.The function accepts the query which we used to send the request.
                This query is used to update the saved data in our cache. .second parameter is the data that should be saved. */
          store.writeQuery({ ...query, data });
        }}
        optimisticResponse={{
          __typename: "mutation",
          addPost: {
            __typename: "Post",
            text: postContent,
            id: -1,
            user: {
              __typename: "User",
              username: "Loading...",
              avatar: "/public/loading.gif",
            },
          },
        }}
        mutation={ADD_POST}
      >
        {(addPost) =>
          React.Children.map(children, function (child) {
            return React.cloneElement(child, {
              addPost,
              postContent,
              changePostContent: self.changePostContent,
            });
          })
        }
      </Mutation>
    );
  }
}
