
import EditProfile from './EditProfile'
import { useSelector } from 'react-redux'
import PortfolioManager from './PortfolioManager'

const Profile = () => {
  const user = useSelector((store)=> store.user)
  return (
    user && (
      <div>
        <EditProfile user={user} />
        {/* <EditProfileForm /> */}
        <PortfolioManager />
      </div>
  )
  )
}

export default Profile
