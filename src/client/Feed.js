import React, { Component } from "react";
import { Helmet } from "react-helmet";
import gql from "graphql-tag";
import { compose, graphql, Query, Mutation } from "react-apollo";
import InfiniteScroll from "react-infinite-scroller";
import FeedList from "./components/post/feedList";
import PostsFeedQuery from "./components/queries/postsFeed";

const ADD_POST = gql`
  mutation addPost($post: PostInput!) {
    addPost(post: $post) {
      id
      text
      user {
        username
        avatar
      }
    }
  }
`;

export default class Feed extends Component {
  constructor(props) {
    super(props);
    this.textarea = React.createRef();
  }

  loadMore = (fetchMore) => {
    const self = this;
    const { page } = this.state;
    /* specify the variables field, which is sent with our request,
     in order to query the correct page index of our paginated posts. */
    fetchMore({
      variables: {
        page: page + 1,
      },
      updateQuery(previousResult, { fetchMoreResult }) {
        /* 
        check whether any new data is included in the response by looking at the returned array length.
        
        if there are not any posts,
        we can set the hasMore state variable to false, which unbinds all scrolling events. 
         */
        if (!fetchMoreResult.postsFeed.posts.length) {
          self.setState({ hasMore: false });
          return previousResult;
        }
        self.setState({ page: page + 1 });

        /* 
        continue and build a new postsFeed object inside of the newData variable.
        The posts array is filled by the previous posts query result and the newly fetched posts. 
        At the end, the newData variable is returned and saved in the client's cache. */
        const newData = {
          postFeed: {
            __typename: "PostFeed",
            posts: [
              ...previousResult.postsFeed.posts,
              ...fetchMoreResult.postsFeed.posts,
            ],
          },
        };
        return newData;
      },
    });
  };

  render() {
    const self = this;
    return (
      <div className="container">
        <div className="postForm">
          <Mutation
            mutation={ADD_POST}
            update={(store, { data: { addPost } }) => {
              const variables = { page: 0, limit: 10 };

              /* It reads the data, which has been saved for this specific query inside of the cache.
                    The data variable holds all of the posts that we have in our feed. */
              const data = store.readQuery({
                query: GET_POSTS,
                variables,
              });

              /* Now that we have all of the posts in an array, we can add the missing post. 
                    Make sure that you know whether you need to prepend or append an item. 
                    In our example, we want to insert a post at the top of our list, so we need to prepend it.
                    You can use the unshift JavaScript function to do this. 
                    We just set our addPost as the first item of the data.posts array. */
              data.posts.unshift(addPost);

              /* . The store.writeQuery.The function accepts the query which we used to send the request.
                    This query is used to update the saved data in our cache. .second parameter is the data that should be saved. */
              store.writeQuery({ query: GET_POSTS, variables, data });
            }}
          >
            {(addPost) => (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addPost({
                    variables: { post: { text: self.textarea.current.value } },
                  }).then(() => {
                    self.textarea.current.value = "";
                  });
                }}
              >
                <textarea
                  ref={this.textarea}
                  placeholder="Write your custom post!"
                />
                <input type="submit" value="Submit" />
              </form>
            )}
          </Mutation>
        </div>
        <PostsFeedQuery>
          <FeedList />
        </PostsFeedQuery>
      </div>
    );
  }
}
