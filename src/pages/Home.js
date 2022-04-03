import React, { useEffect } from 'react';
import "./Home.css";
import { Logo } from '../images/Netflix';
import { ConnectButton, Icon, TabList, Tab, Button, Modal, useNotification } from 'web3uikit';
import { movies } from '../helpers/library';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';

const Home = () => {

  const { isAuthenticated, Moralis, account } = useMoralis();
  const [visible, setVisible] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState();
  const [myMovies, setMyMovies] = useState([]);


  const dispatch = useNotification();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchMyList = async () => {

        await Moralis.start({
          serverUrl: "https://0xwb5czzec4o.usemoralis.com:2053/server",
          appId: "6ZGjzPYaDPSI6M5n5Z65uFgE2oBSuHDrGW7zf1Da",
        }); //if getting errors add this 

        const theList = await Moralis.Cloud.run("getMyList", { addrs: account });
        const filtered = movies.filter(movie => theList.includes(movie.Name));
        setMyMovies(filtered);
      }

      fetchMyList();
    }

  }, [account])

  const handleNewNotification = () => {
    dispatch({
      type: 'error',
      message: 'Please connect your crypto wallet to watch this video',
      title: "Not Authenticated",
      position: 'topL',
    });
  }

  const handleAddNotification = () => {
    dispatch({
      type: "success",
      message: "Movie Added to List",
      title: "Success",
      position: "topL",
    });
  };

  return (
    <>
      <div className='logo'>
        <Logo />
      </div>
      <div className='connect'>
        <Icon fill='#ffffff' size={24} svg="bell" />
        <ConnectButton />
      </div>
      <div className="topBanner">
        <TabList defaultActiveKey={1} tabStyle="bar">
          <Tab tabKey={1} tabName="Movies" >

            <div className='scene'>
              <img src={movies[0].Scene} className="sceneImg" ></img>
              <img src={movies[0].Logo} className="sceneLogo" ></img>
              <p className='sceneDesc'>{movies[0].Description}</p>

              <div className='playButton'>
                <Button
                  icon='chevronRightX2'
                  text='Play'
                  theme='secondary'
                  type='button'
                />

                <Button
                  icon='plus'
                  text='Add to my List'
                  theme='translucent'
                  type='button'
                />
              </div>
            </div>

            <div className='title'>
              Movies
            </div>
            <div className='thumbs'>
              {movies && movies.map((movie, index) => {
                return (
                  <img
                    key={movie.Movie + index}
                    src={movie.Thumnbnail}
                    className="thumbnail"
                    onClick={() => {
                      setSelectedFilm(movie);
                      setVisible(true);
                    }}
                  ></img>
                )
              })}
            </div>

          </Tab>
          <Tab tabKey={2} tabName="Series" isDisabled={true}></Tab>

          <Tab tabKey={3} tabName="My List" >
            <div className="ownListContent">
              <div className="title">Your Library</div>
              {myMovies && isAuthenticated ? (
                <>
                  <div className="ownThumbs">
                    {
                      myMovies.map((e) => {
                        return (
                          <img
                            src={e.Thumnbnail}
                            className="thumbnail"
                            onClick={() => {
                              setSelectedFilm(e);
                              setVisible(true);
                            }}
                          ></img>
                        );
                      })}
                  </div>
                </>
              ) : (
                <div className="ownThumbs">
                  You need to Authenicate To View Your Own list
                </div>
              )}
            </div>


          </Tab>
        </TabList>

        {selectedFilm &&
          <div className='modal'>
            <Modal onCloseButtonPressed={() => {
              setSelectedFilm(null);
              setVisible(false);
            }}
              visible={visible}
              hasFooter={false}
              width={'1000px'}
            >
              <div className='modalContent'>
                <img src={selectedFilm.Scene} className="modalImg" ></img>
                <img src={selectedFilm.Logo} className="modalLogo" ></img>

                <div className='modalPlayButton'>
                  {isAuthenticated ?
                    (
                      <>
                        <Link to='/player' state={selectedFilm?.Movie}>
                          <Button
                            icon='chevronRightX2'
                            text='Play'
                            theme='secondary'
                            type='button'
                          />
                        </Link>
                        <Button
                          icon='plus'
                          text='Add to my List'
                          theme='translucent'
                          type='button'
                          onClick={async () => {
                            await Moralis.Cloud.run("updateMyList", {
                              addrs: account,
                              newFav: selectedFilm.Name,
                            });
                            handleAddNotification();
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <Button
                          icon='chevronRightX2'
                          text='Play'
                          theme='secondary'
                          type='button'
                          onClick={handleNewNotification}
                        />
                        <Button
                          icon='plus'
                          text='Add to my List'
                          theme='translucent'
                          type='button'
                          onClick={handleNewNotification}
                        />
                      </>
                    )
                  }

                </div>

                <div className="movieInfo">
                  <div className="description">
                    <div className="details">
                      <span>{selectedFilm.Year}</span>
                      <span>{selectedFilm.Duration}</span>
                    </div>
                    {selectedFilm.Description}
                  </div>
                  <div className="detailedInfo">
                    Genre:
                    <span className="deets">{selectedFilm.Genre}</span>
                    <br />
                    Actors:
                    <span className="deets">{selectedFilm.Actors}</span>
                  </div>
                </div>

              </div>
            </Modal>
          </div>
        }

      </div>
    </>
  )
}

export default Home;
