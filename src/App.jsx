import React from 'react';
import './App.css';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react-v1';
import { listSongs } from './graphql/queries';
import { updateSong } from './graphql/mutations';

import { useState } from 'react';
import { useEffect } from 'react';

import { IconButton } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteIcon from '@material-ui/icons/Favorite';

Amplify.configure(awsconfig);

function App() {
    const [songs, setSongs] = useState([]);

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            const songData = await API.graphql(graphqlOperation(listSongs));
            const songList = songData.data.listSongs.items;
            console.log('song list', songList);
            setSongs(songList);
        } catch (error) {
            console.log('error on fetching songs', error);
        }
    };

    const addLike = async idx => {
        try {
            const song = songs[idx];
            song.like = song.like + 1;
            delete song.createdAt;
            delete song.updatedAt;

            const songData = await API.graphql(graphqlOperation(updateSong, { input: song }));
            const songList = [...songs];
            songList[idx] = songData.data.updateSong;
            setSongs(songList);
        } catch (error) {
            console.log('error on adding Like to song', error);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <AmplifySignOut />
                <h2>Music Playlist</h2>
            </header>
            <div className="songList">

                <table className="table border shadow">
                    <thead className="table-light">
                        <tr>
                            {/* <th scope="col">ID</th> */}
                            <th scope="col"></th>
                            <th scope="col">Title </th>
                            <th scope="col">Artist</th>
                            <th scope="col">Likes</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            songs.map((song, idx) => (
                                <tr>
                                    <th scope="row">
                                        <IconButton aria-label="play">
                                            <PlayArrowIcon />
                                        </IconButton>
                                    </th>
                                    <td>{song.title}</td>
                                    <td>{song.owner}</td>
                                    <td>
                                        <IconButton aria-label="like" onClick={() => addLike(idx)}>
                                            <FavoriteIcon />
                                        </IconButton>
                                        {song.like}
                                    </td>
                                    <td>
                                        {song.description}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>

            </div>
        </div>
    );
}

export default withAuthenticator(App);