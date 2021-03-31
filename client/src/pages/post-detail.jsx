import React from "react";
import Posting from "../components/Posting";
import CommentCard from "../components/commentCard";
import CommentForm from "../components/commentForm";
import profileee from "../components/ProfileComponent";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import axios from "axios";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import DescriptionIcon from "@material-ui/icons/Description";
import EventNoteIcon from "@material-ui/icons/EventNote";
import ClosedCaptionIcon from "@material-ui/icons/ClosedCaption";
import ShareIcon from "@material-ui/icons/Share";
import FavoriteIcon from "@material-ui/icons/Favorite";
import CommentIcon from "@material-ui/icons/Comment";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";
import IconButton from "@material-ui/core/IconButton";
import ChatIcon from "@material-ui/icons/Chat";
import { Container, TextField, Avatar } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import Header from "../components/Header";

import { connect } from "react-redux";
import Cookies from "js-cookie";

class PostDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      post: null,
      authorName: null,
      comments: [],
      authorsList: [],
      title: "",
      description: "",
      commentOpen: false,
      editOpen: false,
    };
  }

  componentDidMount = async () => {
    //set post's information in state
    const { currentUser } = this.props;
    let doc = null;
    try {
      doc = await axios.get(
        "https://nofun.herokuapp.com/posts/" + this.props.match.params.id + "/"
      );
    } catch {
      return window.alert("Post from other node.");
    }

    console.log("friends: ", currentUser.friends);
    const post = doc.data;
    if (
      post.visibility === "public" ||
      (post.visibility === "private" && post.author === currentUser?.id)
      // || (post.visibility === "friends" && currentUser.friends.includes(post.author))
    ) {
      this.setState({ post, title: post.title, description: post.description });
    }

    //match user's id with the postid to fetch author's username
    const authorDoc = await axios.get("https://nofun.herokuapp.com/author/");
    const authorList = authorDoc.data;
    const the_author_matched = authorList.filter(
      (singleAuthor) => singleAuthor.id == doc.data.author
    );
    this.setState({ authorName: the_author_matched[0].username });
  };

  getAllComments = () => {
    const { post } = this.state;
    var { comments } = this.state;
    comments = post.comments;
    // this.setState({comments:comments});
    console.log(comments);
    return (
      <Container style={{ marginLeft: "10%" }}>
        {comments.length !== 0 ? (
          comments.map((comment) => (
            <CommentCard
              comment={comment}
              handleClick={this.componentDidMount}
            />
          ))
        ) : (
          <div>there's no comment yet</div>
        )}
      </Container>
    );
  };

  handleLike = async () => {
    var { post } = this.state;
    const { token } = this.props.currentUser;
    const csrftoken = Cookies.get("csrftoken");
    const config = {
      headers: {
        Authorization: `Token ${token}`,
        "X-CSRFToken": csrftoken,
        "Content-Type": "application/json",
      },
    };
    var post = post.id;
    await axios.post("https://nofun.herokuapp.com/likes/", { post }, config);
    this.componentDidMount();
  };

  renderLike = () => {
    const { post } = this.state;
    const user = this.props.currentUser;
    const likesToPost = post.likes;
    //看当前user有没有喜欢这个post
    const currentLike = likesToPost.filter((like) => like.author === user.id);
    if (currentLike.length != 0) {
      return <FavoriteIcon color="secondary" size="large" />;
    } else {
      return <FavoriteIcon />;
    }
  };

  renderEdit = () => {
    const { post } = this.state;
    const user = this.props.currentUser;
    const likesToPost = post.likes;
    //看当前user有没有喜欢这个post
    const currentLike = likesToPost.filter((like) => like.author === user.id);
    if (currentLike.length != 0) {
      return <EditIcon size="large" />;
    } else {
      return <EditIcon />;
    }
  };

  handleEdit = () => {
    const { post } = this.state;
    const { id } = this.props.currentUser;
    if (id === post.author) {
      this.setState({ editOpen: !this.state.editOpen });
    }
  };

  handleSubmitEdit = async () => {
    const { post, title, description } = this.state;
    const { token } = this.props.currentUser;
    const csrftoken = Cookies.get("csrftoken");
    const config = {
      headers: {
        Authorization: `Token ${token}`,
        "X-CSRFToken": csrftoken,
        "Content-Type": "application/json",
      },
    };
    await axios.patch(
      "https://nofun.herokuapp.com/posts/" + post.id + "/",
      { title, description },
      config
    );
    this.componentDidMount();
  };

  handleDelete = async () => {
    const { post } = this.state;
    const { token } = this.props.currentUser;
    const csrftoken = Cookies.get("csrftoken");
    const config = {
      headers: {
        Authorization: `Token ${token}`,
        "X-CSRFToken": csrftoken,
        "Content-Type": "application/json",
      },
    };
    await axios.delete(
      "https://nofun.herokuapp.com/posts/" + post.id + "/",
      config
    );
    window.location = "/posts/";
  };

  render() {
    const { post, title, description, editOpen, commentOpen } = this.state;
    const { currentUser } = this.props;
    return (
      <div>
        <Header />
        <div
          style={{ marginLeft: "10%", marginRight: "10%", marginTop: "30px" }}
        >
          {post ? (
            <Grid
              container
              spacing={4}
              direction="horizenol"
              justify="center"
              alignItems="flex-start"
            >
              <Grid item xs={10}>
                <Paper>
                  <div
                    style={{
                      marginLeft: "7%",
                      marginRight: "7%",
                      paddingTop: "3%",
                    }}
                  >
                    <Typography variant="h6">
                      {this.state.authorName}
                    </Typography>
                    <Typography>{post.published.split("T")[0]}</Typography>

                    <img src="https://mentorphiledotcom.files.wordpress.com/2018/09/livedemo-1.png"></img>
                    {editOpen ? (
                      <TextField
                        label="Titile"
                        value={title}
                        onChange={(e) =>
                          this.setState({ title: e.target.value })
                        }
                      />
                    ) : (
                      <Typography variant="h4" style={{ paddingTop: "5%" }}>
                        {post.title}
                      </Typography>
                    )}
                    {editOpen ? (
                      <TextField
                        label="Description"
                        value={description}
                        onChange={(e) =>
                          this.setState({ description: e.target.value })
                        }
                      />
                    ) : (
                      <Typography>{post.description}</Typography>
                    )}
                  </div>
                  <br />
                  <br />
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <center>
              <HourglassEmptyIcon fontSize="small"></HourglassEmptyIcon>
              <Typography variant="h7" style={{ marginLeft: 20 }}>
                The post does not exit OR You do not have the permission to see
                this post!
              </Typography>
            </center>
          )}
          {post ? (
            <div style={{ marginTop: "20px" }}>
              <IconButton
                style={{ marginLeft: "10%" }}
                onClick={this.handleLike}
              >
                {this.renderLike()}
                <div>{post.likes.length}</div>
              </IconButton>
              <IconButton
                style={{ marginLeft: "3%" }}
                onClick={() =>
                  this.setState({ commentOpen: !this.state.commentOpen })
                }
              >
                <CommentIcon></CommentIcon>
              </IconButton>
              <ShareIcon style={{ marginLeft: "10%" }}></ShareIcon>

              {currentUser && currentUser.id === post.author ? (
                editOpen ? (
                  <IconButton
                    style={{ marginLeft: "10%", color: "green" }}
                    onClick={this.handleSubmitEdit}
                  >
                    V
                  </IconButton>
                ) : (
                  <IconButton
                    style={{ marginLeft: "10%" }}
                    onClick={this.handleEdit}
                  >
                    {this.renderEdit()}
                  </IconButton>
                )
              ) : null}
              {currentUser && currentUser.id === post.author ? (
                <IconButton
                  style={{ marginLeft: "10%", color: "red" }}
                  onClick={this.handleDelete}
                >
                  X
                </IconButton>
              ) : null}
              {commentOpen ? (
                <div style={{ marginLeft: "10%" }}>
                  <CommentForm
                    post={post}
                    handleClick={this.componentDidMount}
                  />
                </div>
              ) : null}
              {this.getAllComments()}
              <br />
              <br />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(PostDetail);
