import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector} from "react-redux"
import { useEffect } from "react";
import {addFeed} from "../utils/feedSlice";
import UserCard from "./UserCard";


const Feed = () => {
  const feed = useSelector((store) => store.feed);  // Get feed from Redux store
  // console.log(feed)
  const dispatch = useDispatch();

  // API Call to Fetch Feed
  const getFeed = async()=> {
    if(feed) return;  // If feed is already available, don’t fetch again
    try {
      const res = await axios.get(BASE_URL+ "/feed", {withCredentials : true});  // Fetch feed
      dispatch(addFeed(res?.data?.data));     // Dispatch action to store data
      // console.log(res.data) ;
    } catch (error) {
        console.log(error)
    }
  };

  useEffect(()=> {
    getFeed();   // Call getFeed only once after mounting
  },[]);

  if(!feed) {return};    // If feed is still null/undefined, render nothing

  if(feed.length <= 0){
    // If the feed is empty, display a message.
    return (
      <h1 className="flex justify-center my-10">No new Users found!</h1>
    )
  }


  // If feed is not empty, display the first user in the array using UserCard
  return (
    feed && (
      <div className="flex justify-center my-10">
        <UserCard user={feed[0]} />
      </div>
    )
    
  )
}

export default Feed