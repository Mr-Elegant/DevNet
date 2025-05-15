import axios from "axios"
import { useDispatch, useSelector } from 'react-redux'
import { BASE_URL } from '../utils/constants'
import Footer from './Footer'
import NavBar from './NavBar'
import { Outlet, useNavigate } from 'react-router-dom'
import {addUser} from "../utils/userSlice.js"
import { useEffect } from 'react'

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user)


  const fetchUser = async () => {     
    if(userData) return;       // if userData is already present then no more again auth api call
    try {
      const res = await axios.get(BASE_URL + "/profile/view", {withCredentials:true});
      dispatch(addUser(res.data))
    } catch (error) {
        if(error.status === 401){
          navigate("/login");
        }
        console.log(error)
    }
  }

  useEffect(()=> {
    fetchUser();
  },[])

  return (
    <div>
        <NavBar />
        <Outlet />
        <Footer />
    </div>
  )
}

export default Body