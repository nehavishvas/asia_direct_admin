import React, { useEffect, useState } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { useContext } from 'react';
import { MyContext1 } from '../../Context/MyContext';
import logoMob from "../../Assests/logo.png";
import SideBar from '../Sidebar/SideBar';
const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);
  const [userData, setUserData] = useState({});
  const [image, setImage] = useState([])
  const { text, setText } = useContext(MyContext1)
  const userId = JSON.parse(localStorage.getItem("data123"))?.id;
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchProfileData();
      markNotificationsAsSeen();
    }
  }, [userId]);
  const fetchNotifications = async () => {
    try {
      const userType = JSON.parse(localStorage.getItem("data123") || "{}")?.user_type;
      let useAdminList = false;

      if (userId && userType) {
        try {
          const postdata = {
            staff_id: userId,
            route_url: "/Admin/notifications",
            user_type: userType,
          };
          const permResponse = await axios.post(
            `${process.env.REACT_APP_BASE_URL}CheckPermission`,
            postdata
          );
          if (permResponse.data && permResponse.data.success === true) {
            useAdminList = true;
          }
        } catch (err) {
          console.error("Permission check failed in Header:", err);
        }
      }

      let response;
      if (useAdminList) {
        response = await axios.post(`${process.env.REACT_APP_BASE_URL}notification-list`, {
          page: 1,
          limit: 10,
        });
      } else {
        response = await axios.post(`${process.env.REACT_APP_BASE_URL}notification-users`, { user_id: userId });
      }

      setNotifications(response.data.data || []);
      setCount(response.data.unseenCount || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  };
  const fetchProfileData = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}get-profile-admin`, { user_id: userId });
      setImage(response.data.data.profile)
      setUserData(response.data.data || {});
    } catch (error) {
      toast.error("Failed to fetch profile data");
    }
  };
  const markNotificationsAsSeen = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}notification-status`, { user_id: userId });
    } catch (error) {
      console.error("Failed to mark notifications as seen");
    }
  };
  const handleNotificationClick = () => {
    navigate('/Admin/notifications');
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };
  const dataget = JSON.parse(localStorage.getItem("data123"))
  // pp

  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <header className='header' style={{ backgroundColor: "#f0f2f5" }}>
      <div className='headerSide'>
        <div className='d-flex h-100 py-2 justify-content-between justify-content-md-end align-items-center px-4'>
          <div class="d-block d-md-none"><img src={logoMob} alt="Logo" height="50" />
          </div>
          <div className='d-flex justify-content-end align-items-center gap-4'>

            <div className=''>
              <Dropdown>
                <Dropdown.Toggle variant="" id="dropdown-basic">
                  <NotificationsActiveIcon className='fs-3' />
                  {count > 0 && <Badge bg="danger">{count}</Badge>}
                </Dropdown.Toggle>
                <Dropdown.Menu className='sidebar123 pt-0'>
                  <p className=' ps-3 notiHead mb-0 py-2'>Notifications</p>
                  <div className='notificationScroll'>
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <div className='bg-light border-bottom notificationAsiaBack' onClick={handleNotificationClick} key={index}>
                          <Dropdown.Item>
                            <h6 className='mt-2'>{notification.title}</h6>
                            <p className='description'><small>{notification.description}</small></p>
                          </Dropdown.Item>
                        </div>
                      ))
                    ) : (
                      <p className='text-center'>No new notifications</p>
                    )}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div style={{ width: '35px', height: '35px' }} className='me-0 me-md-5'>
              <img
                src={text && text !== "null" ? `${process.env.REACT_APP_BASE_URL_image}${text}` : (image && image !== "null" && image !== "undefined" ? `${process.env.REACT_APP_BASE_URL_image}${image}` : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>")}
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
                }}
                alt="User Profile"
                id="basic-button"
                aria-controls={anchorEl ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? 'true' : undefined}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                style={{ cursor: 'pointer', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#f1f5f9', objectFit: 'cover' }}
              />
            </div>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              MenuListProps={{ 'aria-labelledby': 'basic-button' }}
            >
              <MenuItem onClick={() => { navigate('/Admin/profile'); setAnchorEl(null); }}>Profile</MenuItem>
              <MenuItem onClick={() => { navigate('/Admin/changepassword'); setAnchorEl(null); }}>Change Password</MenuItem>
              <MenuItem onClick={() => { navigate('/Admin/User'); setAnchorEl(null); }}>Messages</MenuItem>
              {
                dataget.id == "1" ?
                  "" : <MenuItem onClick={() => { navigate('/Admin/Profilesection'); setAnchorEl(null); }}>Manage Leave</MenuItem>
              }
              <MenuItem onClick={() => { handleLogout(); setAnchorEl(null); }}>Logout</MenuItem>
            </Menu>
            <button class="d-none barBtn" onClick={() => setSidebarOpen(!sidebarOpen)}><i class="fa fa-bars" aria-hidden="true"></i></button>
          </div>
        </div>
        <div className={sidebarOpen ? "sidebarShow" : "sidebarHide"}>
          <i class="fa fa-times closeSideMob " aria-hidden="true" onClick={() => setSidebarOpen(false)}></i>
          <SideBar />

        </div>
      </div>
    </header>
  );
};
export default Header;
