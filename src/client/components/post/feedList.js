import React, { Component } from "react";
import InfiniteScroll from "react-infinite-scroller";
import Post from "./";
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
export default class FeedList extends Component {
  state = {
    page: 0,
    hasMore: true,
  };
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
          postsFeed: {
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
    const { posts, fetchMore } = this.props;
    const { hasMore } = this.state;
    return (
      <div className="feed">
        <InfiniteScroll
          loadMore={() => self.loadMore(fetchMore)}
          hasMore={hasMore}
          loader={
            <div className="loader" key={"loader"}>
              Loading ...
            </div>
          }
        >
          {posts.map((post, i) => (
            <Post key={post.id} post={post} />
          ))}
        </InfiniteScroll>
      </div>
    );
  }
}
