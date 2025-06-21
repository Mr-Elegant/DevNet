import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector} from "react-redux"
import { useEffect } from "react";
import {addFeed} from "../utils/feedSlice";
import UserCard from "./UserCard";


const Feed = () => {
  const feed = useSelector((store) => store.feed);  // reading feed 
  console.log(feed)
  const dispatch = useDispatch();

  const getFeed = async()=> {
    if(feed) return;
    try {
      const res = await axios.get(BASE_URL+ "/feed", {withCredentials : true});
      dispatch(addFeed(res?.data?.data));     // addFeed is action
      // console.log(res.data) ;
    } catch (error) {
        console.log(error)
    }
  };

  useEffect(()=> {
    getFeed();
  },[]);
  if(!feed) {return};

  if(feed.length <= 0){
    return (
      <h1 className="flex justify-center my-10">No new Users found!</h1>
    )
  }

  return (
    feed && (
      <div className="flex justify-center my-10">
        <UserCard user={feed[0]} />
      </div>
    )
    
  )
}

export default Feed