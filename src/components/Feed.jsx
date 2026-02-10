import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector} from "react-redux"
import { useEffect } from "react";
import {addFeed} from "../utils/feedSlice";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();

  const getFeed = async()=> {
    if(feed) return;
    try {
      const res = await axios.get(BASE_URL+ "/feed", {withCredentials : true});
      dispatch(addFeed(res?.data?.data));
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content/70">No new users found!</h1>
          <p className="text-base-content/50 mt-2">Check back later for new connections</p>
        </div>
      </div>
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