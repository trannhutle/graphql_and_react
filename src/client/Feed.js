import React, { Component } from "react";
import { Helmet } from "react-helmet";
import gql from "graphql-tag";
import { compose, graphql, Query, Mutation } from "react-apollo";

const GET_POSTS = gql`
  {
    posts {
      id
      text
      user {
        avatar
        username
      }
    }
  }
`;

const ADD_POST = gql`
  mutation addPost($post: PostInput!) {
    addPost(post: $Post) {
      id
      text
      user {
        username
        avatar
      }
    }
  }
`;

const ADD_POST_MUTATION = graphql(ADD_POST, {
  name: "addPost",
});
const GET_POSTS_QUERY = graphql(GET_POSTS, {
  props: ({ data: { loading, error, posts } }) => ({
    loading,
    posts,
    error,
  }),
});
export default class Feed extends Component {
  state = {
    postContent: "",
    hasMore: true,
    page: 0,
  };
  handleSubmit = (event) => {
    event.preventDefault();
    const newPost = {
      id: this.state.posts.length + 1,
      text: this.state.postContent,
      user: {
        avatar: "/uploads/avatar1.png",
        username: "Fake User",
      },
    };
    this.props.addPost({ variables: { post: newPost } }).then(() => {
      self.setState((prevState) => ({
        postContent: "",
      }));
    });
  };
  handlePostContentChange = (event) => {
    this.setState({ postContent: event.target.value });
  };
  if(loading) {
    return "Loading...";
  }
  if(error) {
    return error.message;
  }
  render() {
    const self = this;
    const { postContent } = this.state;

    return (
      <Query query={GET_POSTS}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return error.message;

          const { posts } = data;

          return (
            <div className="container">
              <div className="postForm">
                <Mutation
                  mutation={ADD_POST}
                  update={(store, { data: { addPost } }) => {
                    /* It reads the data, which has been saved for this specific query inside of the cache.
                    The data variable holds all of the posts that we have in our feed. */
                    const data = store.readQuery({ query: GET_POSTS });

                    /* Now that we have all of the posts in an array, we can add the missing post. 
                    Make sure that you know whether you need to prepend or append an item. 
                    In our example, we want to insert a post at the top of our list, so we need to prepend it.
                    You can use the unshift JavaScript function to do this. 
                    We just set our addPost as the first item of the data.posts array. */
                    data.posts.unshift(addPost);

                    /* . The store.writeQuery.The function accepts the query which we used to send the request.
                    This query is used to update the saved data in our cache. .second parameter is the data that should be saved. */
                    store.writeQuery({ query: GET_POSTS, data });
                  }}
                  /* 
                  The optimisticResponse can be anything from a function to a simple object.however, needs to be a GraphQL response object.
                  

                  */
                  optimisticResponse={{
                    __typename: "mutation",
                    addPost: {
                      __typename: "Post",
                      text: postContent,
                      /* React expects that every component in a loop gets a unique key.
                      Minus one is never used by any other post, because MySQL starts counting at one.   */
                      id: -1,
                      user: {
                        __typename: "User",
                        userName: "Loading ...",
                        avatar: "/public/loading.gif",
                      },
                    },
                  }}
                >
                  {(addPost) => (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        addPost({
                          variables: { post: { text: postContent } },
                        }).then(() => {
                          self.setState((prevState) => ({
                            postContent: "",
                          }));
                        });
                      }}
                    >
                      <textarea
                        value={postContent}
                        onChange={self.handlePostContentChange}
                        placeholder="Write 
                    your custom post!"
                      />
                      <input type="submit" value="Submit" />
                    </form>
                  )}
                </Mutation>
              </div>
              <div className="feed">
                {posts.map((post, i) => (
                  <div
                    key={post.id}
                    className={`post ${post.id < 0 ? "optimistic" : ""}`}
                  >
                    <div className="header">
                      <img src={post.user.avatar} />
                      <h2>{post.user.username}</h2>
                    </div>
                    <p className="content">{post.text}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}
