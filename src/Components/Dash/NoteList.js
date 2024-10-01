import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import './NoteList.css';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      const notesSnapshot = await getDocs(collection(db, 'notes'));
      const notesData = notesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(notesData);
    };

    fetchNotes();
  }, []);

  const addNote = async () => {
    if (newNote.trim() === '') return;
    const currentDate = new Date();
    const docRef = await addDoc(collection(db, 'notes'), { text: newNote, date: currentDate });
    setNotes([...notes, { id: docRef.id, text: newNote, date: currentDate }]);
    setNewNote('');
  };

  const deleteNote = async (id) => {
    await deleteDoc(doc(db, 'notes', id));
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="note-list">
      <h3>Sticky Notes</h3>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            <div>
              <p>{note.text}</p>
              <small>{new Date(note.date?.seconds * 1000).toLocaleString()}</small>
            </div>
            <button onClick={() => deleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div className="add-note">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note..."
        />
        <button onClick={addNote}>Add</button>
      </div>
    </div>
  );
};

export default NoteList;
