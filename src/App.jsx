import React from 'react';
import './App.css';
import Amplify, { API, graphqlOperation, Storage } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react-v1';
import { listSongs } from './graphql/queries';
import { createSong, updateSong } from './graphql/mutations';

import { useState } from 'react';
import { useEffect } from 'react';

import { v4 as uuid } from 'uuid'

import { IconButton, TextField } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PauseIcon from '@material-ui/icons/Pause';
import AddIcon from '@material-ui/icons/Add';
import ReactPlayer from 'react-player';
import PublishIcon from '@material-ui/icons/Publish';

Amplify.configure(awsconfig);

function App() {
    const [songs, setSongs] = useState([]);
    const [songPlaying, setSongPlaying] = useState('')
    const [audioURL, setAudioURL] = useState('')
    const [showAddSong, setShowAddSong] = useState(false)

    useEffect(() => {
        fetchSongs();
    }, []);

    const toggleSong = async idx => {
        if (songPlaying === idx) {
            setSongPlaying('')
            return
        }

        const songFilePath = songs[idx].filePath;
        try {
            const fileAccessURL = await Storage.get(songFilePath, { expires: 60 })
            console.log('access url', fileAccessURL);
            setSongPlaying(idx);
            setAudioURL(fileAccessURL);
            return;
        }
        catch (error) {
            console.error('error accessing the file from s3', error);
            setAudioURL('');
            setSongPlaying('');
        }

        setSongPlaying(idx)
        return
    }

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
                <h2>Music Player</h2>
            </header>
            <div className="songList">

                <table className="table border shadow">
                    <thead className="table-light">
                        <tr>
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
                                        <IconButton aria-label="play" onClick={() => toggleSong(idx)}>
                                            {songPlaying === idx ? <PauseIcon /> : <PlayArrowIcon />}
                                        </IconButton>
                                    </th>
                                    <td>
                                        {song.title}
                                        {
                                            songPlaying === idx && (
                                                <div>
                                                    <ReactPlayer
                                                        url={audioURL}
                                                        controls
                                                        playing
                                                        height="40px"
                                                        width="500px"
                                                        onPause={() => toggleSong(idx)}
                                                    />
                                                </div>
                                            )
                                        }
                                    </td>
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
                {
                    showAddSong ? (
                        <AddSong onUpload={() => {
                            setShowAddSong(false)
                            fetchSongs()
                        }} />
                    ) : (<IconButton onClick={() => setShowAddSong(true)}>
                        <AddIcon />
                    </IconButton>
                    )
                }

            </div>
        </div>
    );
}

export default withAuthenticator(App);

const AddSong = ({ onUpload }) => {

    const [songData, setSongData] = useState({});
    const [mp3Data, setMp3Data] = useState();


    const uploadSong = async () => {
        //Upload the song
        console.log('songData', songData);
        const { title, description, owner } = songData;

        const { key } = await Storage.put(`${uuid()}.mp3`, mp3Data, { contentType: 'audio/mp3' });
        const createSongInput = {
            id: uuid(),
            title,
            description,
            owner,
            filePath: key,
            like: 0
        }
        await API.graphql(graphqlOperation(createSong, { input: createSongInput }))
        onUpload();
    }
    return (
        <div className="newSong">
            <TextField
                label="Title"
                value={songData.title}
                onChange={e => setSongData({ ...songData, title: e.target.value })}
            />
            <TextField
                label="Artist"
                value={songData.owner}
                onChange={e => setSongData({ ...songData, owner: e.target.value })}
            />
            <TextField
                label="Description"
                value={songData.description}
                onChange={e => setSongData({ ...songData, description: e.target.value })}
            />
            <input type="file" accept="audio/mp3" onChange={e => setMp3Data(e.target.files[0])} />
            <IconButton onClick={uploadSong}>
                <PublishIcon />
            </IconButton>
        </div>
    )
}