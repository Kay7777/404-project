import React from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import axios from "axios";
import { connect } from "react-redux";
import { setCurrentUser } from "../redux/user/useractions";


class ProfileCard extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      editOpen: false,
      id: props.user.id,
      token: props.user.token,
      username: props.user.username,
      email: props.user.email,
      github: props.user.github,
      password: props.user.password,
      host: props.user.host,
      displayName: props.user.displayName
    }
  }

  handleEditProfile = async () => {
    const { id } = this.state;
    const { domains, domain } = this.props;
    const { email, github, password, displayName } = this.state;
    let auth = null;

    domains.map(d => {
      if (d.domain === domain) {
        auth = d.auth;
      }
    })

    const config = {
      headers: {
        Authorization: auth,
      },
    };

    
    const doc = await axios.put(id + "/", { displayName, email, github, password }, config);
    if (doc.data) {
      await this.props.setCurrentUser(doc.data);
      window.location = `/authors/${id.split("/")[2]}/${id.split("/")[4]}/`;
    }
  }

  handleAddFriend = async () => {
    const {  id } = this.state;
    const { domain } = this.props;
    const { currentUser } = this.props;
    const { domains } = this.props;

    let auth = null;

    domains.map(d => {
      if (d.domain === domain) {
        auth = d.auth;
      }
    })

    const config = {
      headers: {
        Authorization: auth,
      },
    };


    const doc = await axios.post("https://" + domain + "/friend-request/", {
      summary: "friend request",
      actor: currentUser.id,
      object: "https://" + domain + "/author/" + id + "/"
    }, config);
    
    if (doc.data) {
      window.alert(doc.data);
    } else {
      window.alert("Fail!");
    }
  }

  // TODO: delete a friend
  handleDeleteFriend = async () => {
    const {  id } = this.state;
    const { currentUser, domains, domain } = this.props;
    let auth = null;

    domains.map(d => {
      if (d.domain === domain) {
        auth = d.auth;
      }
    })

    const config = {
      headers: {
        Authorization: auth,
      },
    };

    const doc = await axios.patch("https://nofun.herokuapp.com/friendrequest/delete", {from_user: currentUser.id, to_user: id}, config);
    if (doc.data) {
      window.alert(doc.data);
    }
  }

  

  render(){
    const { editOpen, displayName, email, password, url, username, github, host} = this.state;
    const { currentUser } = this.props;
    return (
      <Paper style={{ overflow: "auto" }}>
        <Card >
          <CardContent width={1}>
            <Typography
              color="textSecondary"
              gutterBottom
            >
              <AccountBoxIcon fontSize="large"></AccountBoxIcon>
              <b>{displayName}</b>
            </Typography>
            {
              editOpen ?
              <div>
                <TextField label="Email" value={email} onChange={(e) => this.setState({email: e.target.value})} />
                <TextField label="DisplayName" value={displayName} onChange={(e) => this.setState({displayName: e.target.value})} />
                <TextField label="Password" value={password} onChange={(e) => this.setState({password: e.target.value})} />
                <TextField label="Github" value={github} onChange={(e) => this.setState({github: e.target.value})} />
              </div>
              :
              <div>
                <Typography variant="body1" component="h4">
                  Email: {email}
                </Typography>
                <Typography variant="body1" component="h4">
                  DisplayName: {displayName}
                </Typography>
                <Typography variant="body1" component="h4">
                  UserName: {username}
                </Typography>
                <Typography variant="body1" component="h4">
                  Github: {github}
                </Typography>
                <Typography variant="body1" component="h4">
                  Host: {host}
                </Typography>
                <Typography variant="body1" component="h4">
                  URL: {url}
                </Typography>
              </div>
            }
          </CardContent>
          <CardActions>
            {
              editOpen ? 
              <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={this.handleEditProfile}
              style={{ marginLeft: "10px", marginBottom: "10px" }}
            >
              Confirm
            </Button>
            :
              currentUser?.id === this.props.user.id ?
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PersonAddIcon />}
                onClick={() => this.setState({editOpen: !this.state.editOpen})}
                style={{ marginLeft: "10px", marginBottom: "10px" }}
              >
                Edit
              </Button>
              :
              <div>
                <Button color="primary" variant="contained" onClick={this.handleAddFriend}>Add</Button>
                {/* <Button color="secondary" variant="contained" style={{marginLeft: 15}} onClick={this.handleDeleteFriend}>Delete</Button> */}
              </div>
            }
          </CardActions>
        </Card>
      </Paper>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
  domains: state.domain.domains
});

const mapDispatchToProps = (dispatch) => ({
  setCurrentUser: (user) => dispatch(setCurrentUser(user)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileCard);

