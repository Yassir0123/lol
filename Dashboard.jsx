import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import withAdminCheck from './withAdminCheck';
import { auth } from '../../../firebase';
import { getDatabase, onValue, ref } from 'firebase/database';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import WelcomeBanner from '../partials/dashboard/WelcomeBanner';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DashboardCard04 from '../partials/dashboard/DashboardCard04';

const datee = new Date();
const year = datee.getFullYear();
const month = ("0" + (datee.getMonth() + 1)).slice(-2);
const day = ("0" + datee.getDate()).slice(-2);
const formattedDate = `${year}-${month}-${day}`;
const [sideUserInfos, setSideUserInfos] = useState(false)

function Dashboard() {
{/*Connection a la base de donnée  and store on getdata*/}
const db = getDatabase();
const [getdata,setdata]=useState([]);

{/*its me    */}

useEffect(() => {
  
  const referencedetable=ref(db,'users');//ref of the table wanted to get the data from
  onValue(referencedetable, (snapshot) => {
    const data = snapshot.val();
    const usersWithBorrows = Object.entries(data).filter(([userId, user]) => {
      const borrows = user.borrows;
      return borrows !== undefined && Object.values(borrows).length > 0;
    }).map(([userId, user]) => {
      const borrows = user.borrows;
      
      const userBorrows = Object.entries(borrows).map(([borrowId, borrow]) => {
        console.log(borrow.return_date);
        const returnDate = new Date(borrow.return_date);
        const today = new Date();
        if (returnDate < today) {
          return { ...borrow, userId, borrowId };
        } else {
          return null;
        }
      }).filter(borrow => borrow !== null);
      return userBorrows;
    }).flat();
    console.log(usersWithBorrows);
    setdata(usersWithBorrows)
  });
  

}, []);
function UserFullName({ userId }) {
  const db = getDatabase();
  const userDataRef = ref(db, `users/${userId}`);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    onValue(userDataRef, (snapshot) => {
      const userData = snapshot.val();
      console.log(userData);
      setUserData(userData);
    });
  }, []);

  if (userData) {
    return userData.fullname;
  } else {
    return <div>Loading user data...</div>;
  }
}

function BookTitle({ bookId }) {
  const db = getDatabase();
  const bookDataRef = ref(db, `books/${bookId}`);
  const [bookData, setBookData] = useState(null);

  useEffect(() => {
    onValue(bookDataRef, (snapshot) => {
      const bookData = snapshot.val();
      console.log(bookData);
      setBookData(bookData);
    });
  }, []);

  if (bookData) {
    return bookData.title;
  } else {
    return <div>Loading book data...</div>;
  }
}

function SideUserInfos({userId}){
  //here goes the code for the sidebar
}

function OpenSideUserInfos({userId}){
  //here goes your code
}

{/*Connection a la base de donnée*/}
  const prevPageRef = useRef();
  const history = useHistory();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    prevPageRef.current = history.location.state || '/';
  }, [history.location.state]);

  if (prevPageRef.current !== 'http://localhost:5173/admin') {
    //history.push('/');
    console.log(prevPageRef.current);
  }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Welcome banner */}
            <WelcomeBanner />

            {/* Cards 
              <div className="grid grid-cols-12 gap-6">
              <DashboardCard04 />
            </div>
            */}
            
            {/* Table */}
            <h1 className='text-3xl font-bold'>Overdue Borrows</h1>
            
            <TableContainer component={Paper} sx={{ height: 'calc(100% - 120px)', overflow: 'auto' }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="left">MEMBER</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="left">BOOK TITLE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="left">OVERDUE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="left">RETURN DATE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  { getdata.length > 0 ? ( getdata.map((data) => (
                    <TableRow
                      key={data.borrowId}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {data.borrowId}
                      </TableCell>
                      <TableCell align="left">
                        <UserFullName userId={data.userId}/>
                      </TableCell>
                      <TableCell align="left">
                        <BookTitle bookId={data.Book_id}/>
                      </TableCell>
                      <TableCell align="left" sx={{
                        color: 'red',
                        fontWeight: '700'
                      }}>
                        {
                          (() => {
                            const today = new Date();
                            const retDate = new Date(data.return_date);
                            console.log(data.return_date);
                            console.log(today);
                            const diff = retDate - today;
                            const days = -1*Math.floor(diff / (1000 * 60 * 60 * 24)); 
                            return days;
                          })()
                        } days ago
                      </TableCell>
                      <TableCell align="left">{data.return_date.substring(0,10)}</TableCell>
                    </TableRow>
                  ))) : (<TableRow>
                    <TableCell>
                      All Clear
                    </TableCell>
                  </TableRow>)}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminCheck(Dashboard);