import React from "react";
import CommentCard from "../components/commentCard";
import CommentForm from "../components/commentForm";
import Typography from "@material-ui/core/Typography";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import axios from "axios";
import ShareIcon from "@material-ui/icons/Share";
import FavoriteIcon from "@material-ui/icons/Favorite";
import IconButton from "@material-ui/core/IconButton";
import CommentIcon from "@material-ui/icons/Comment";
import { Container, TextField, Avatar } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import Header from "../components/Header";
import { connect } from "react-redux";
import Radio from "@material-ui/core/Radio";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";


class PostDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      post: null,
      author: null,
      comments: [],
      authorsList: [],
      title: "",
      content: "",
      description: "",
      commentOpen: false,
      editOpen: false,
      imageLocal: true,
      domain: props.match.params.domain,
      authorId: props.match.params.authorId,
      postId: props.match.params.postId,
    };
  }

  componentDidMount = async () => {
    const { currentUser, domains } = this.props;
    const { domain, authorId, postId } = this.state;
    let auth = null;
    domains.map(d => {
      if (d.domain === domain) {
        auth = d.auth;
      }
    });

    const config = {
      headers: {
        "Authorization": auth,
      },
    };

    const post_id = "https://" + domain + "/author/" + authorId + "/posts/" + postId + "/";

    const doc = await axios.get(post_id, config);

    let post = null;
    if (doc.data.length === undefined) {
      post = doc.data;
    } else {
      post = doc.data[0];
    }

    if (
      post?.visibility === "PUBLIC" ||
      (post?.author_id === currentUser?.id || post?.author === currentUser?.id )
    ) {
      this.setState({ post, contentType: post.contentType, title: post.title, content: post.content, description: post.description });
    }

    const doc2 = await axios.get(post_id + "comments/", config);

    this.setState({ comments: doc2.data });

    const authorDoc = await axios.get(
      "https://" + domain + "/author/" + authorId + "/",
      config
    );
    const author = authorDoc.data;

    this.setState({ author });
  };

  getAllComments = () => {
    const { comments } = this.state;
    const { domain, authorId, postId } = this.state;

    return (
      <Container style={{ marginTop: "2%" }}>
        {comments.length !== 0 ? (
          comments.map((comment) => (
            <CommentCard
              comment={comment}
              domain={domain}
              authorId={authorId}
              postId={postId}
              handleClick={this.componentDidMount}
            />
          ))
        ) : (
          <center>
            <Typography variant="h7" style={{ marginLeft: 20 }}>
              there's no comment yet
            </Typography>
          </center>
        )}
      </Container>
    );
  };

  handleLike = async () => {
    const { domains } = this.props;
    const { domain, post } = this.state;
    let auth = null;

    domains.map(d => {
      if (d.domain === domain) {
        auth = d.auth;
      }
    });

    const config = {
      headers: {
        "Authorization": auth,
      },
    };

    await axios.post(post.id + "/likes/", config);
    this.componentDidMount();
  };

  encodeFileBase64 = (file) => {
    var reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        var Base64 = reader.result;
        this.setState({ content: Base64 });
      };
      reader.onerror = (error) => {
        console.log("error: ", error);
      };
    }
  };

  handleEdit = () => {
    const { post } = this.state;
    const { id } = this.props.currentUser;
    if (id === post.author || id === post.author_id) {
      this.setState({ editOpen: !this.state.editOpen });
    }
  };

  handleSubmitEdit = async () => {
    const { post, title, content, description, domain, authorId, postId } = this.state;
    const {  domains } = this.props;
    let auth = null;
    domains.map(d => {
      if (d.domain === domain) {
        auth = d.auth;
      }
    });

    const config = {
      headers: {
        "Authorization": auth,
      },
    };

    console.log("content: ", content);

    await axios.put(post.id + "/", {...post, title, description, content }, config);
    window.location = "/posts/" + domain + "/" + authorId + "/" + postId;
  };

  handleDelete = async () => {
    const { post, domain } = this.state;
    const { domains } = this.props;

    let auth = null;
    domains.map(d => {
      if (d.domain === domain) {
        auth = d.auth;
      }
    });

    const config = {
      headers: {
        "Authorization": auth,
      },
    };

    await axios.delete(post.id + "/", config);
    window.location = "/";
  };

  render() {
    const { imageLocal, post, title, contentType, description, content, editOpen, commentOpen, author, domain, authorId, postId } = this.state;
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
              <Grid item xs={8}>
                <Paper>
                  <div
                    style={{
                      marginLeft: "7%",
                      marginRight: "7%",
                      paddingTop: "3%",
                    }}
                  >
                    <Typography variant="h6">{author?.displayName}</Typography>
                    <Typography>{post.published.split("T")[0]}</Typography>
                    <Typography>Type: {post.contentType}</Typography>
                    {post.contentType.includes("image") && (
                      !editOpen && <img src={post.content} style={{ width: "500px" }} onClick={
                        () => {
                          window.location = "/posts/" + domain + "/" + authorId + "/" + postId +"/image/"
                        }
                      }/>
                    )}
                    {editOpen ? (
                      <TextField
                        label="Titile"
                        value={title}
                        onChange={(e) =>
                          this.setState({ title: e.target.value })
                        }
                      />
                    ) : (
                      <Typography variant="h5" style={{ paddingTop: "5%" }}>
                        Title: {post.title}
                      </Typography>
                    )}
                    {contentType === "image" && (editOpen ? (
                      <TextField
                        label="description"
                        value={description}
                        onChange={(e) =>
                          this.setState({ description: e.target.value })
                        }
                      />
                    ) : (
                      <Typography>Description: {post.description}</Typography>
                    ))}
                    {
                      contentType === "image" ?
                        editOpen && (
                          <div className="row" id="image" style={{marginLeft: "3%", marginTop: "2%"}}>
                            <FormControl
                              component="fieldset"
                              style={{
                                marginLeft: "3%",
                                marginRight: "3%",
                                marginTop: "3%",
                                width: "94%",
                              }}
                              onChange={(e) => {
                                this.setState({ imageLocal: e.target.value === "true" });
                              }}
                            >
                              <FormLabel component="legend">
                                How do you want to upload the image?
                              </FormLabel>
                              <RadioGroup row aria-label="visible" name="visible">
                                <FormControlLabel
                                  value={"true"}
                                  checked={imageLocal}
                                  control={<Radio />}
                                  label="Local Image"
                                />
                                <FormControlLabel
                                  value={"false"}
                                  checked={!imageLocal}
                                  control={<Radio />}
                                  label="URL"
                                />
                              </RadioGroup>
                            </FormControl>
                            {
                              imageLocal ?
                                <div>
                                <FormLabel style={{marginRight: "20px"}}>
                                  Upload an Image from local machine
                                </FormLabel>
                                <input type="file" onChange={(e) => this.encodeFileBase64(e.target.files[0])} />
                                </div>
                                :
                                <div>
                                  <FormLabel style={{marginTop: "30px", marginRight: "20px"}}>Input image URL</FormLabel>
                                  <TextField style={{width: "80%"}} label="Image" onChange={(e) => this.setState({content: e.target.value})}/>
                                </div>
                            }
                            {content && <div>
                              <img src={content} style={{width: "40%"}} />
                              <IconButton
                                style={{ marginLeft: "3%", color: "red" }}
                                onClick={() => this.setState({content: ""})}
                              >
                                X
                              </IconButton>
                            </div>}
                          </div>
                        )
                        :
                        editOpen ? (
                          <TextField
                            label="content"
                            value={content}
                            onChange={(e) =>
                              this.setState({ content: e.target.value })
                            }
                          />
                        ) : (
                          <Typography>Content: {post.content}</Typography>
                        )
                    }
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
          
          {post && (
            <div >
              <div style={{marginTop: "2%"}}>
              <IconButton
                style={{ marginLeft: "17%" }}
                onClick={this.handleLike}
              >
                <FavoriteIcon color="secondary" size="large" />
              </IconButton>
              <IconButton
                style={{ marginLeft: "3%" }}
                onClick={() =>
                  this.setState({ commentOpen: !this.state.commentOpen })
                }
              >
                <CommentIcon />
              </IconButton>
              <IconButton style={{ marginLeft: "3%" }}>
                <ShareIcon />
              </IconButton>

              {currentUser && (post.author_id === currentUser?.id || post.author === currentUser?.id ) && (
                editOpen ? (
                  <IconButton
                    style={{ marginLeft: "3%", color: "green" }}
                    onClick={this.handleSubmitEdit}
                  >
                    V
                  </IconButton>
                ) : (
                  <IconButton
                    style={{ marginLeft: "3%" }}
                    onClick={this.handleEdit}
                  >
                    <EditIcon size="large" />
                  </IconButton>
                )
              )}
              {(currentUser && (post.author_id === currentUser?.id || post.author === currentUser?.id )) && (
                <IconButton
                  style={{ marginLeft: "3%", color: "red" }}
                  onClick={this.handleDelete}
                >
                  X
                </IconButton>
              )}
              </div>
              {commentOpen && (
                <div>
                  <CommentForm
                    post={post}
                    handleClick={this.componentDidMount}
                  />
                </div>
              )}
              {this.getAllComments()}
              <br />
              <br />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
  domains: state.domain.domains
});

export default connect(mapStateToProps)(PostDetail);
