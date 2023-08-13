import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../config/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { actions } from "../../store/index";
import { setRevisionHistory } from "../../actions/setRevisionHistory";
const SaveForLater = (props) => {
  const userId = useSelector((state) => state.id);
  const currentUser = useSelector((state) => state);
  const savedPostId = useSelector((state) => state.saved);

  const [save, setSave] = useState(false);
  const dispatch = useDispatch();
  const revisionHistory=useSelector(state=>state.revisionHistory);
  const currUser=useSelector(state=>state);
  useEffect(() => {
    try {
      if (savedPostId.includes(props.postId)) {
        setSave(true);
      }
    } catch (err) {
      console.log(err);
    }
  }, [props.postId]);
  const saveHandler = async (e) => {
    //console.log(userId);
    setSave(true);
    const user = doc(db, "users", userId);
    //console.log(user.doc.data());
    let newSaved=[];

    if (currentUser.saved === undefined||currentUser.saved===null) {
        newSaved .push(props.postId);
        console.log("un");
      } else {
        newSaved = [...currentUser.saved, props.postId];
      }
    //console.log(newSaved);
    const save = { arr: newSaved };
    //console.log(save);
    dispatch(actions.changeCurrentUserSaved(save));
    const newUser = { ...currentUser, saved: newSaved};
    //console.log(newSaved);
    await updateDoc(user, newUser);
    
    
    setRevisionHistory(revisionHistory,dispatch,currUser,props.title,"saved");
    //save post here
  };
  const unsaveHandler = async (e) => {
    //console.log(userId,currentUser);
    
    const user = doc(db, "users", userId);
    const newSaved = savedPostId.filter((savedId) => savedId !== props.postId);
    const newUser = { ...currentUser, saved: newSaved };
    const save = { arr: newSaved };
    dispatch(actions.changeCurrentUserSaved(save));
    console.log(newSaved);
    await updateDoc(user, newUser);
    
    setRevisionHistory(revisionHistory,dispatch,currUser,props.title,"removed from saved posts");
    setSave(false);
    //save post here
  };
  return (
    <div className="flex-item pointer">
      {!save && (
        <div>
          <svg
            onClick={saveHandler}
            aria-label="Save"
            color="white"
            fill="rgb(0, 0, 0)"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
          >
            <title>Save</title>
            <polygon
              fill="none"
              points="20 21 12 13.44 4 21 4 3 20 3 20 21"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></polygon>
          </svg>
        </div>
      )}

      {save && (
        <svg
          onClick={unsaveHandler}
          aria-label="Remove"
          color="white"
          fill="#e7e7e7"
          height="24"
          role="img"
          viewBox="0 0 24 24"
          width="24"
        >
          <title>Remove</title>
          <path d="M20 22a.999.999 0 0 1-.687-.273L12 14.815l-7.313 6.912A1 1 0 0 1 3 21V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1Z"></path>
        </svg>
      )}
    </div>
  );
};
export default SaveForLater;
