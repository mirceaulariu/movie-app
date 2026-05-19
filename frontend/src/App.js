import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './firebase';
import Login from './login';
import AccountMenu from './accountMenu';
import { db } from './firebase';
import { doc, deleteDoc, query, where, onSnapshot, collection, addDoc, serverTimestamp } from "firebase/firestore";


const COUNTRIES = [
  { code: 'RO', name: 'Romania 🇷🇴' },
  { code: 'US', name: 'USA 🇺🇸' },
  { code: 'GB', name: 'United Kingdom 🇬🇧' },
  { code: 'DE', name: 'Germany 🇩🇪' },
];


const watchedIconButtonStyle = {
  position: 'absolute', top: '10px', right: '10px', backgroundColor: 'white',
  border: 'none', borderRadius: '50%', width: '32px', height: '32px',
  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 10
};

const watchedGridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '20px', marginTop: '20px'
};

const watchedItemStyle = { textAlign: 'center', position: 'relative' };

const watchedPosterStyle = {
  width: '100%', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
};

const watchedTitleStyle = {
  fontSize: '0.8rem', fontWeight: 'bold', marginTop: '8px',
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
};

const removeWatchedButtonStyle = {
  fontSize: '0.7rem', color: '#ef4444', background: 'none', border: 'none',
  cursor: 'pointer', fontWeight: 'bold', marginTop: '4px'
};


const notificationCenterStyle = {
  backgroundColor: 'white',
  padding: '40px',
  borderRadius: '24px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  maxWidth: '700px',
  margin: '40px auto',
  textAlign: 'center'
};

const notifCardStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 20px',
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  border: '1px solid #eee'
};

const profileCardStyle = {
  backgroundColor: 'white', padding: '40px', borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '600px',
  margin: '40px auto', textAlign: 'center'
};

const deleteButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.2rem',
  cursor: 'pointer',
  padding: '5px',
  borderRadius: '8px',
  transition: 'background-color 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const statusBadgeStyle = (status) => ({
  padding: '5px 12px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  backgroundColor: status === 'pending' ? '#fef3c7' : '#d1fae5',
  color: status === 'pending' ? '#92400e' : '#065f46'
});

const backButtonStyle = {
  padding: '10px 20px', backgroundColor: '#ddd', border: 'none',
  borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
};

const alertBoxStyle = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #10b981',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '30px',
  color: '#065f46',
  textAlign: 'left',
  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
};

function App() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userNotifications, setUserNotifications] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [notifyMovie, setNotifyMovie] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [region, setRegion] = useState('RO');
  const [loading, setLoading] = useState(false);
  const [isTrending, setIsTrending] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "watched_movies"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setWatchedMovies(list);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    //query to find a user's notifications
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );

    //live listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      setUserNotifications(notifications);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);


  // //trending movies on start
  // useEffect(() => {
  //   const fetchTrending = async () => {
  //     try {
  //       const response = await axios.get('http://localhost:5000/api/trending');
  //       setMovies(response.data);
  //     } catch (err) {
  //       console.error("Could not load trending movies");
  //     }
  //   };
  //   fetchTrending();
  // }, []);


  const fetchTrendingMovies = async (targetRegion) => {
    setLoading(true);
    setIsTrending(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/trending?region=${targetRegion}`);
      setMovies(response.data);
    } catch (err) {
      console.error("Could not load trending movies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchTrendingMovies(region);
    }
    else {
      handleSearch(region);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);


  const handleAddToWatched = async (movie) => {
    //check if already watched
    const alreadyWatched = watchedMovies.some(m => m.movieId === movie.id);
    if (alreadyWatched) {
      alert("You've already marked this as watched!");
      return;
    }

    try {
      await addDoc(collection(db, "watched_movies"), {
        userId: user.uid,
        movieId: movie.id,
        movieTitle: movie.title,
        posterPath: movie.poster || "",
        addedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding to watched:", error);
    }
  };

  const handleRemoveWatched = async (id) => {
    try {
      await deleteDoc(doc(db, "watched_movies", id));
    } catch (error) {
      console.error("Error removing watched movie:", error);
    }
  };

  const availableMovies = userNotifications.filter(n => n.status === 'available');
  const hasNotifications = availableMovies.length > 0;

  const togglePlatform = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };


  const handleSaveNotification = async () => {
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform!");
      return;
    }

    try {

      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        userEmail: user.email,
        movieId: notifyMovie.id,
        movieTitle: notifyMovie.title,
        platforms: selectedPlatforms,
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      alert("Preference saved! We'll monitor these for you.");
      setNotifyMovie(null);
      setSelectedPlatforms([]);
    } catch (error) {
      console.error("Error saving preference: ", error);
      alert("Failed to save. Try again later.");
    }
  };

  const handleDeleteNotification = async (notifId) => {
    //ask for confirmation so you don't delete by accident
    if (window.confirm("Are you sure you want to stop tracking this movie?")) {
      try {
        //reference the specific document in the "notifications"
        const docRef = doc(db, "notifications", notifId);

        //delete from Firestore
        await deleteDoc(docRef);

      } catch (error) {
        console.error("Error deleting notification:", error);
        alert("Failed to delete. Please try again.");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = async (passedRegion) => {
    const activeRegion = typeof passedRegion === 'string' ? passedRegion : region;
    if (!searchQuery && typeof passedRegion !== 'string') return;

    setLoading(true);
    setIsTrending(false);
    setSelectedMovie(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/search?q=${searchQuery}&region=${activeRegion}`
      );
      setMovies(response.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa' }}>
        <Login />
      </div>
    );
  }

  if (showNotifications) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px' }}>
        <AccountMenu
          user={user}
          hasAlert={hasNotifications}
          onViewProfile={() => { setShowProfile(true); setShowNotifications(false); }}
          onViewNotifications={() => setShowNotifications(true)}
        />

        <button onClick={() => setShowNotifications(false)} style={backButtonStyle}>← Back to Home</button>

        <div style={notificationCenterStyle}>
          <h2 style={{ color: '#4f46e5', marginBottom: '10px' }}>Notification Center</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>Manage your movie tracking and alerts.</p>

          {/* alert box for available movies */}
          {hasNotifications && (
            <div style={alertBoxStyle}>
              <h3 style={{ margin: '0 0 10px 0' }}>🎉 Good News!</h3>
              {availableMovies.map(movie => (
                <p key={movie.id} style={{ margin: '5px 0' }}>
                  <strong>{movie.movieTitle}</strong> is now ready to stream on your selected platform!
                </p>
              ))}
            </div>
          )}

          {/* list of tracked movies */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {userNotifications.length === 0 ? (
              <p style={{ color: '#999' }}>You aren't tracking any movies yet.</p>
            ) : (
              userNotifications.map((notif) => (
                <div key={notif.id} style={notifCardStyle}>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>{notif.movieTitle}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                      Tracking on: {notif.platforms.join(', ')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={statusBadgeStyle(notif.status)}>
                      {notif.status === 'pending' ? '⏳ Monitoring' : '✅ Available'}
                    </div>
                    <button onClick={() => handleDeleteNotification(notif.id)} style={deleteButtonStyle}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showProfile) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px' }}>
        <AccountMenu
          user={user}
          hasAlert={hasNotifications}
          onViewProfile={() => {
            setShowProfile(true);
            setShowNotifications(false);
            setSelectedMovie(null);
          }}
          onViewNotifications={() => {
            setShowNotifications(true);
            setShowProfile(false);
            setSelectedMovie(null);
          }}
        />

        <button onClick={() => setShowProfile(false)} style={backButtonStyle}>← Back to Home</button>
        {/* {hasNotifications && (
          <div style={alertBoxStyle}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>🎉 Good News!</h3>
            {availableMovies.map(movie => (
              <p key={movie.id} style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                <strong>{movie.movieTitle}</strong> is now available on your selected platforms!
              </p>
            ))}
          </div>
        )}
        <div style={profileCardStyle}>
          <h2 style={{ color: '#4f46e5', marginBottom: '25px' }}>🔔 My Tracking Center</h2>

          {userNotifications.length === 0 ? (
            <p style={{ color: '#999', fontStyle: 'italic' }}>You aren't tracking any movies yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {userNotifications.map((notif) => (
                <div key={notif.id} style={notifCardStyle}>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>{notif.movieTitle}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                      Watching: {notif.platforms.join(', ')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={statusBadgeStyle(notif.status)}>
                      {notif.status === 'pending' ? '⏳ Monitoring' : '✅ Available!'}
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      style={deleteButtonStyle}
                      title="Stop tracking"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div> */}

        <div style={profileCardStyle}>
          <h3 style={{ borderBottom: '2px solid #4f46e5', display: 'inline-block', paddingBottom: '5px' }}>
            🎥 Watched Movies ({watchedMovies.length})
          </h3>

          <div style={watchedGridStyle}>
            {watchedMovies.length === 0 ? (
              <p style={{ color: '#999', gridColumn: '1 / -1' }}>Your watched list is empty.</p>
            ) : (
              watchedMovies.map((m) => (
                <div key={m.id} style={watchedItemStyle}>
                  <img
                    src={`https://image.tmdb.org/t/p/w200${m.posterPath}`}
                    alt={m.movieTitle}
                    style={watchedPosterStyle}
                  />
                  <p style={watchedTitleStyle}>{m.movieTitle}</p>
                  <button
                    onClick={() => handleRemoveWatched(m.id)}
                    style={removeWatchedButtonStyle}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={profileCardStyle}>
          <h2 style={{ color: '#4f46e5' }}>Account Information</h2>
          <div style={{ textAlign: 'left', marginTop: '20px' }}>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.uid}</p>
            <p><strong>Account Created:</strong> {user.metadata.creationTime}</p>
            <p><strong>Subscription:</strong> Free Tier (Romania)</p>
          </div>
        </div>
      </div>
    );
  }


  // MOVIE DETAIL PAGE
  if (selectedMovie) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px', fontFamily: 'Arial' }}>
        <AccountMenu
          user={user}
          hasAlert={hasNotifications}
          onViewNotifications={() => {
            setShowNotifications(true);
            setShowProfile(false);
            setSelectedMovie(null);
          }}
          onViewProfile={() => {
            setSelectedMovie(null);
            setShowProfile(true);
          }}
        />

        <button
          onClick={() => setSelectedMovie(null)}
          style={{
            marginBottom: '30px', padding: '12px 25px', backgroundColor: '#4f46e5',
            color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer',
            fontWeight: 'bold', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
          }}
        >
          ← Back to Results
        </button>

        <div style={{
          display: 'flex', gap: '40px', backgroundColor: 'white', padding: '40px',
          borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          maxWidth: '1000px', margin: '0 auto', flexWrap: 'wrap'
        }}>
          <img
            src={selectedMovie.poster}
            alt="poster"
            style={{ width: '350px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
          />

          <div style={{ flex: 1, textAlign: 'left', minWidth: '300px' }}>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: '#1a1a1a' }}>{selectedMovie.title}</h1>
            <p style={{ color: '#6c757d', fontSize: '1.2rem', marginBottom: '25px' }}>
              📅 {selectedMovie.release_date?.split('-')[0]}  •  ⭐ {selectedMovie.rating?.toFixed(1)}/10
            </p>

            <h3 style={{ color: '#4f46e5', marginBottom: '10px' }}>Overview</h3>
            <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.05rem', marginBottom: '30px' }}>
              {selectedMovie.overview || "No description available."}
            </p>

            <h3 style={{ color: '#4f46e5', marginBottom: '15px' }}>Streaming in {region}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {selectedMovie.platforms && selectedMovie.platforms.length > 0 ? (
                selectedMovie.platforms.map((p, i) => (
                  <a
                    key={i}
                    href={selectedMovie.watch_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <span
                      // key={i} style={{
                      //   backgroundColor: '#eef2ff', color: '#4f46e5', padding: '10px 20px',
                      //   borderRadius: '10px', fontWeight: 'bold', border: '1px solid #e0e7ff'
                      // }}

                      style={{
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#3730a3';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 15px rgba(79, 70, 229, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#4f46e5';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.2)';
                      }}

                    >
                      {p} ↗
                    </span>
                  </a>
                ))
              ) : (
                <p style={{ fontStyle: 'italic', color: '#999' }}>Not available for streaming.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const notifyButtonStyle = {
    width: '100%', padding: '10px', backgroundColor: 'transparent',
    color: '#4f46e5', border: '2px solid #4f46e5', borderRadius: '10px',
    fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', fontSize: '0.85rem'
  };

  const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 3000
  };

  const notificationCardStyle = {
    backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '320px', textAlign: 'center'
  };

  const optionsGridStyle = {
    textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px'
  };

  const optionLabelStyle = { display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' };

  const saveButtonStyle = { flex: 1, padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
  const cancelButtonStyle = { flex: 1, padding: '12px', backgroundColor: '#eee', border: 'none', borderRadius: '10px', cursor: 'pointer' };

  // MAIN GRID VIEW
  return (
    <div style={{ backgroundColor: '#f8f9fa', color: '#212529', minHeight: '100vh', fontFamily: 'Arial' }}>
      <AccountMenu
        user={user}
        hasAlert={hasNotifications}
        onViewNotifications={() => {
          setShowNotifications(true);
          setShowProfile(false);
          setSelectedMovie(null);
        }}
        onViewProfile={() => {
          setSelectedMovie(null);
          setShowProfile(true);
        }}
      />

      {/* MAIN SECTION */}
      <div style={{
        height: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(rgba(255,255,255,0.4), #f8f9fa), url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1500&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textAlign: 'center',
        padding: '0 20px'
      }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '10px', color: '#1a1a1a', fontWeight: '800', letterSpacing: '-1px' }}>
          🎬 Stream Finder
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#4a4a4a', maxWidth: '600px', opacity: 0.9 }}>
          Stop scrolling. Find exactly where your favorite movies are streaming in your country.
        </p>

        {/* SEARCH & FILTER CONTAINER */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>

          {/* search bar */}
          <div style={{
            display: 'flex',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            borderRadius: '40px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            width: '100%',
            maxWidth: '500px'
          }}>
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to watch?"
              style={{
                padding: '16px 25px',
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                color: '#333'
              }}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              style={{
                padding: '0 30px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                transition: '0.3s'
              }}
            >
              {loading ? '...' : 'SEARCH'}
            </button>
          </div>

          {/* region selector */}
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
            }}
            style={{
              padding: '14px 20px',
              borderRadius: '40px',
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              color: '#333',
              cursor: 'pointer',
              outline: 'none',
              fontSize: '1rem'
            }}
          >
            {COUNTRIES.map(c => <option key={c.code} value={c.code} style={{ color: 'black' }}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div style={{ padding: '0 50px 50px 50px', marginTop: '-50px' }}>
        <h2 style={{ marginBottom: '30px', fontSize: '1.8rem', fontWeight: '600' }}>
          {isTrending ? (searchQuery ? `🔍 Results for "${searchQuery}"` : `🔥 Trending Today`) : `🔍 Results for "${searchQuery}"`}
        </h2>

        {/* MOVIE GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '30px'
        }}>
          {movies
            .filter(movie => movie.poster && !movie.poster.includes('placeholder'))
            .map((movie) => (
              <div
                key={movie.id}
                onClick={() => setSelectedMovie(movie)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease',
                  height: '100%',
                  cursor: 'pointer'
                }}

                onMouseEnter={() => setHoveredCard(movie.id)}
                onMouseLeave={() => setHoveredCard(null)}

                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {(() => {
                  const isWatched = watchedMovies.some(m => m.movieId === movie.id);
                  const isHovered = hoveredCard === movie.id;

                  //render the button if it is hovered or watched
                  if (isHovered || isWatched) {
                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToWatched(movie);
                        }}
                        style={watchedIconButtonStyle}
                        title={isWatched ? "Watched" : "Mark as watched"}
                      >
                        {isWatched ? '✅' : '➕'}
                      </button>
                    );
                  }
                  return null;
                })()}


                <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', textAlign: 'center' }}>
                  <h3 style={{
                    color: '#1a1a1a',
                    fontSize: '1.1rem',
                    margin: '0 0 5px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.8rem'
                  }}>
                    {movie.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '15px' }}>
                    {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
                  </p>

                  {movie.platforms && (
                    <div style={{ marginTop: 'auto', width: '100%' }}>
                      <strong style={{ fontSize: '0.75rem', color: '#aaa', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Streaming on:
                      </strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                        {movie.platforms && movie.platforms.length > 0 ? (
                          movie.platforms.map((p, i) => (
                            <a
                              key={i}
                              href={movie.watch_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ textDecoration: 'none' }}
                            >
                              <span key={i} style={{
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                display: 'inline-block',
                                transition: '0.2s'
                              }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#3730a3'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
                              >
                                {p}
                              </span>
                            </a>
                          ))
                        ) : (
                          // <span style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>Not found</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifyMovie(movie);
                            }}
                            style={{
                              width: '100%',
                              padding: '3px',
                              backgroundColor: 'transparent',
                              color: '#4f46e5',
                              border: '2px solid #4f46e5',
                              borderRadius: '10px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              transition: '0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#4f46e5';
                              e.target.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#4f46e5';
                            }}
                          >
                            🔔 Notify Me
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* platform selection modal */}
      {
        notifyMovie && (
          <div style={modalOverlayStyle}>
            <div style={notificationCardStyle}>
              <h3>Notify me for: {notifyMovie.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Which platforms should we monitor?</p>

              <div style={optionsGridStyle}>
                {['Netflix', 'HBO Max', 'Disney+', 'SkyShowtime', 'Amazon Prime'].map(platform => (
                  <label key={platform} style={optionLabelStyle}>
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform)}
                      onChange={() => togglePlatform(platform)}
                      style={{ cursor: 'pointer' }}
                    /> {platform}
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={handleSaveNotification} style={saveButtonStyle}>
                  Save Preference
                </button>
                <button onClick={() => setNotifyMovie(null)} style={cancelButtonStyle}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default App;