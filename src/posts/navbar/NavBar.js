import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import profileImage from "../../images/profile.png";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../store";
import Button from "@mui/material/Button";

const NavBar = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutHandler = async () => {
    try {
      dispatch(actions.changeCurrentUser("reset"));
      await signOut(auth);

      //console.log('hi');
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="navbar-container">
        <div>
        <Link to='/saved-posts' className="pages">
        Saved Posts
        </Link>
        <Link to='/drafts' className="pages">
        Drafts
        </Link>
        <Link to='/my-posts' className="pages">
        My Posts
        </Link>
        <Link to='/revision-history' className="pages">
        History
        </Link>
        <Link to='/pay' className="pages">
        Buy Posts
        </Link>
        <Link to='/lists' className="pages">
        Lists
        </Link>
        </div>
        <div className="navbar-right">
          <Link to="/profile">
            <img
              className="navbar-profile"
              src={profileImage}
              alt="profile photo"
            />
          </Link>
          <Link to="/add" className="navbar-write">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-label="Write"
            >
              <path
                d="M14 4a.5.5 0 0 0 0-1v1zm7 6a.5.5 0 0 0-1 0h1zm-7-7H4v1h10V3zM3 4v16h1V4H3zm1 17h16v-1H4v1zm17-1V10h-1v10h1zm-1 1a1 1 0 0 0 1-1h-1v1zM3 20a1 1 0 0 0 1 1v-1H3zM4 3a1 1 0 0 0-1 1h1V3z"
                fill="currentColor"
              ></path>
              <path
                d="M17.5 4.5l-8.46 8.46a.25.25 0 0 0-.06.1l-.82 2.47c-.07.2.12.38.31.31l2.47-.82a.25.25 0 0 0 .1-.06L19.5 6.5m-2-2l2.32-2.32c.1-.1.26-.1.36 0l1.64 1.64c.1.1.1.26 0 .36L19.5 6.5m-2-2l2 2"
                stroke="currentColor"
              ></path>
            </svg>
            <div className="write">Write</div>
          </Link>
          <button onClick={logoutHandler} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </>
  );
};
export default NavBar;
