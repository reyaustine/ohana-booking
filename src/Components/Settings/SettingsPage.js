import React, { useState } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../Contexts/UserContext';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user, updateUser } = useUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    try {
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      alert(`Error updating password: ${error.message}`);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    const storage = getStorage();
    const avatarRef = ref(storage, `avatars/${user.email}`);
    try {
      await uploadBytes(avatarRef, avatarFile);
      const downloadURL = await getDownloadURL(avatarRef);

      const userDocRef = doc(db, 'users', user.email);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          photoURL: downloadURL
        });
      } else {
        await setDoc(userDocRef, {
          email: user.email,
          photoURL: downloadURL
        });
      }

      // Update user context and local storage
      const updatedUser = { ...user, photoURL: downloadURL };
      updateUser(updatedUser);

      alert('Avatar updated successfully!');
      setAvatarPreview(downloadURL);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(`Error uploading avatar: ${error.message}`);
    }
  };

  return (
    <div className="settings-page">
      <h2>User Settings</h2>
      
      <section className="avatar-section">
        <h3>Update Avatar</h3>
        <div className="avatar-preview">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar preview" />
          ) : user?.photoURL ? (
            <img src={user.photoURL} alt="Current avatar" />
          ) : (
            <div className="avatar-placeholder">No avatar</div>
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
        <button onClick={handleAvatarUpload} disabled={!avatarFile} className="btn">
          Upload Avatar
        </button>
      </section>

      <section className="password-section">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordChange} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">Update Password</button>
        </form>
      </section>
    </div>
  );
};

export default SettingsPage;