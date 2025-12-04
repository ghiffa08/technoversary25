import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Send, X, Heart, MessageSquare, Plus, User, Image as ImageIcon, Sparkles, RefreshCw, Circle, Loader2, AlertTriangle, Settings, ChevronRight } from 'lucide-react';

// --- FIREBASE IMPORTS (REALTIME DATABASE) ---
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { 
  getDatabase, 
  ref, 
  push, 
  set, 
  onValue, 
  runTransaction, 
  serverTimestamp as rtdbTimestamp 
} from "firebase/database";

// --- CONFIG CLOUDINARY ---
const CLOUDINARY_CLOUD_NAME = "dosny0nzd"; 
const CLOUDINARY_UPLOAD_PRESET = "technoversary25"; 

// --- FIREBASE INITIALIZATION ---
let auth;
let db;
let isFirebaseInitialized = false;

// Config Manual (TechnoVersary 25)
const firebaseConfig = {
  apiKey: "AIzaSyBAW461nCZKnRXN53L-iwuV4_uscJmryNA",
  authDomain: "technoversary25.firebaseapp.com",
  databaseURL: "https://technoversary25-default-rtdb.firebaseio.com", 
  projectId: "technoversary25",
  storageBucket: "technoversary25.firebasestorage.app",
  messagingSenderId: "1055233796262",
  appId: "1:1055233796262:web:c68f08bb3637c9671f2c67",
  measurementId: "G-KK1TEMX4ER"
};

try {
  const apps = getApps();
  let app;
  
  if (apps.length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  auth = getAuth(app);
  db = getDatabase(app); // Menggunakan Realtime Database
  isFirebaseInitialized = true;
  console.log("Firebase RTDB initialized successfully");
} catch (error) {
  console.error("Firebase Init Error:", error);
}

// --- UTILS: Image Optimization ---
const compressImage = (dataUrl, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', quality);
    };
  });
};

// --- UI Components ---
const Button = ({ children, variant = 'primary', className = '', disabled, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-12 px-6 py-2";
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-200 active:scale-95 transition-transform",
    secondary: "bg-orange-50 text-orange-900 hover:bg-orange-100 border border-orange-100",
    outline: "border border-orange-200 bg-transparent hover:bg-orange-50 text-orange-700",
    ghost: "hover:bg-orange-50 text-orange-700",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    link: "text-stone-500 underline-offset-4 hover:underline",
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }) => (
  <input 
    className={`flex h-12 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea 
    className={`flex min-h-[100px] w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-stone-100 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

// --- SUB-VIEWS ---

const CameraView = ({ onCapture, onClose, fileInputRef }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user'); 
  
  useEffect(() => {
    let currentStream;
    const startCamera = async () => {
      try {
        const constraints = { video: { facingMode: facingMode }, audio: false };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) videoRef.current.srcObject = currentStream;
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    startCamera();
    return () => { if (currentStream) currentStream.getTracks().forEach(track => track.stop()); };
  }, [facingMode]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      onCapture(canvas.toDataURL('image/jpeg'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="text-white p-2 rounded-full bg-black/20 backdrop-blur-sm">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-medium text-sm">Ambil Foto</span>
        <div className="w-10" /> 
      </div>
      <div className="flex-1 relative overflow-hidden rounded-b-3xl">
         <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
      </div>
      <div className="h-40 bg-black flex items-center justify-around px-8 pb-8 pt-4">
         <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-xl bg-stone-800 flex items-center justify-center text-white hover:bg-stone-700">
           <ImageIcon className="w-6 h-6" />
         </button>
         <button onClick={takePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 hover:scale-105 active:scale-95 transition-all">
           <div className="w-full h-full bg-white rounded-full border-4 border-orange-500" />
         </button>
         <button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-white hover:bg-stone-700">
           <RefreshCw className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
};

// --- Post Item Component with Comments ---
const PostItem = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);

  const handleSendComment = async () => {
    if(!commentText.trim()) return;
    setIsSendingComment(true);
    await onComment(post.id, commentText);
    setCommentText("");
    setIsSendingComment(false);
  };

  return (
    <Card className="overflow-hidden group border-stone-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3] bg-stone-200">
        <img src={post.image} alt="Moment" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
          <div className="flex items-center gap-2 text-white">
            <span className="font-semibold text-sm">{post.name}</span>
            <span className="text-xs text-white/70">• {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'Baru saja'}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-stone-700 text-sm leading-relaxed">"{post.message}"</p>
        
        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-stone-50 pt-3">
          <button 
            onClick={() => onLike(post.id)}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-red-500 transition-colors group/like"
          >
            <Heart className={`w-4 h-4 group-active/like:scale-125 transition-transform ${post.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} /> 
            {post.likes || 0} Suka
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-orange-500 transition-colors"
          >
            <MessageSquare className="w-4 h-4" /> 
            {post.comments ? post.comments.length : 0} Komentar
          </button>
        </div>

        {/* Comment Section */}
        {showComments && (
           <div className="mt-4 pt-3 border-t border-stone-100 bg-stone-50/50 -mx-4 px-4 pb-4 animate-in slide-in-from-top-2">
             <div className="space-y-3 mb-3 max-h-40 overflow-y-auto">
               {post.comments && post.comments.length > 0 ? (
                 post.comments.map((c, idx) => (
                   <div key={idx} className="text-xs">
                     <span className="font-bold text-stone-800">{c.user}: </span>
                     <span className="text-stone-600">{c.text}</span>
                   </div>
                 ))
               ) : (
                 <p className="text-xs text-stone-400 italic">Belum ada komentar.</p>
               )}
             </div>
             
             <div className="flex gap-2">
               <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Tulis komentar..."
                  className="flex-1 text-xs border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
               />
               <button 
                 onClick={handleSendComment}
                 disabled={isSendingComment}
                 className="bg-orange-600 text-white rounded-lg px-3 py-1 text-xs font-bold disabled:opacity-50"
               >
                 {isSendingComment ? '...' : <Send className="w-3 h-3" />}
               </button>
             </div>
           </div>
        )}
      </div>
    </Card>
  );
}

const FeedView = ({ posts, setView, onLike, onComment, loading }) => (
  <div className="pb-24 animate-in fade-in duration-500 bg-stone-50 min-h-screen">
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500 fill-orange-500" />
          Techno Versary
        </h1>
        <p className="text-xs text-stone-500 font-medium">Kick Start Your Career!</p>
      </div>
    </div>

    <div className="px-4 py-6">
      <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-xl shadow-orange-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h2 className="text-lg font-bold mb-2">Seminar Nasional 2025</h2>
          <p className="text-orange-50 text-sm mb-4">Abadikan momen belajarmu bersama Pak Avip & pemateri hebat lainnya!</p>
          <Button variant="secondary" className="w-full gap-2 font-semibold text-orange-700 bg-white hover:bg-stone-50 border-none" onClick={() => setView('camera')}>
            <Camera className="w-4 h-4" />
            Buka Kamera
          </Button>
        </div>
      </div>
    </div>

    <div className="px-4 space-y-6">
      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
        <Circle className="w-3 h-3 fill-orange-500 text-orange-500" />
        Live Feed
      </h3>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-stone-200">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <Camera className="w-8 h-8 text-orange-300" />
          </div>
          <p className="text-stone-500 font-medium">Belum ada momen.</p>
          <p className="text-xs text-stone-400">Jadilah yang pertama memposting!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostItem key={post.id} post={post} onLike={onLike} onComment={onComment} />
        ))
      )}
    </div>
    
    <div className="fixed bottom-6 right-6 z-20">
      <button onClick={() => setView('camera')} className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-white shadow-lg shadow-orange-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
        <Camera className="w-7 h-7" />
      </button>
    </div>
  </div>
);

const UploadView = ({ capturedImage, formData, setFormData, isSubmitting, statusMessage, handleSubmit, resetForm, setView }) => (
  <div className="min-h-screen bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
    <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
      <h2 className="text-lg font-bold text-stone-900">Post Momen</h2>
      <button onClick={() => { resetForm(); setView('feed'); }} className="p-2 -mr-2 text-stone-400 hover:text-stone-900">
        <X className="w-6 h-6" />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="relative w-full aspect-[4/3] bg-stone-900 rounded-2xl overflow-hidden shadow-inner border border-stone-100 group">
           {capturedImage ? (
             <>
              <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />
              {!isSubmitting && (
                <button onClick={() => setView('camera')} className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all">
                  <RefreshCw className="w-4 h-4" /> Foto Ulang
                </button>
              )}
             </>
           ) : (
             <div className="w-full h-full flex items-center justify-center text-white">Loading...</div>
           )}
           
           {/* Loading Overlay */}
           {isSubmitting && (
             <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm px-6 text-center">
                <Loader2 className="w-10 h-10 animate-spin mb-3 text-orange-500" />
                <p className="font-semibold text-lg">{statusMessage || "Memproses..."}</p>
                <p className="text-xs text-stone-400 mt-2">Mohon tunggu sebentar ya.</p>
             </div>
           )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-900">Nama Kamu</label>
            <Input placeholder="Contoh: Rizky Fauzi" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-900">Kesan & Pesan</label>
            <Textarea placeholder="Gimana kesan kamu ketemu Pak Avip?" className="resize-none h-32" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} disabled={isSubmitting} />
          </div>
        </div>
      </div>
    </div>

    <div className="p-6 border-t border-stone-100 bg-stone-50/50">
      <Button className="w-full gap-2 text-base h-14 bg-orange-600 hover:bg-orange-700 text-white" onClick={handleSubmit} disabled={!formData.name || !formData.message || !capturedImage || isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Mengirim...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Kirim Momen
          </>
        )}
      </Button>
    </div>
  </div>
);

// --- MAIN APP ---

export default function App() {
  const [view, setView] = useState('feed'); 
  const [posts, setPosts] = useState([]); 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Auth & Data Listener
  useEffect(() => {
    if (!isFirebaseInitialized) {
      console.error("Firebase not initialized yet!");
      return;
    }

    const initAuth = async () => {
       try {
         // Priority 1: Check if environment custom token exists
         if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            try {
              await signInWithCustomToken(auth, __initial_auth_token);
            } catch (error) {
              if (error.code === 'auth/custom-token-mismatch' || error.code === 'auth/invalid-custom-token') {
                 console.warn("Auth Fallback to Anonymous");
                 await signInAnonymously(auth);
              } else {
                 throw error;
              }
            }
         } else {
            await signInAnonymously(auth);
         }
       } catch (error) {
         console.error("Auth Error:", error);
         try { await signInAnonymously(auth); } catch(e) {}
       }
    };
    initAuth();
    
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribeAuth();
  }, []);

  // --- Realtime DB Data Fetching ---
  useEffect(() => {
    if (!user || !isFirebaseInitialized) return;
    
    // Reference ke node 'moments'
    const momentsRef = ref(db, 'moments');
    
    const unsubscribe = onValue(momentsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedPosts = [];

      if (data) {
        // Konversi Object RTDB ke Array
        Object.keys(data).forEach((key) => {
           const item = data[key];
           // Handle comments object -> array
           const commentsArray = item.comments 
             ? Object.values(item.comments).sort((a,b) => b.time - a.time)
             : [];

           loadedPosts.push({
             id: key,
             ...item,
             comments: commentsArray
           });
        });
      }

      // Sort client-side (Newest First)
      loadedPosts.sort((a, b) => {
        const tA = a.timestamp || 0;
        const tB = b.timestamp || 0;
        return tB - tA;
      });
      
      setPosts(loadedPosts);
      setLoading(false);
    }, (error) => {
      console.error("RTDB Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  const [capturedImage, setCapturedImage] = useState(null);
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCapturedImage(URL.createObjectURL(file));
      setView('upload');
    }
  };

  const handleCapture = (imageDataUrl) => {
    setCapturedImage(imageDataUrl);
    setView('upload');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message || !capturedImage || !user) return;

    setIsSubmitting(true);
    setStatusMessage("Mengompresi Gambar...");

    try {
      // 1. Upload Cloudinary (Tetap sama)
      const compressedBlob = await compressImage(capturedImage, 800, 0.7);
      
      setStatusMessage("Mengupload ke Server Gambar...");
      const data = new FormData();
      data.append("file", compressedBlob);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(`Upload Gambar Gagal: ${errData.error?.message || response.statusText}`);
      }
      
      const cloudData = await response.json();
      
      // 2. Save Data to Realtime Database
      setStatusMessage("Menyimpan ke Database...");
      
      const momentsRef = ref(db, 'moments');
      const newPostRef = push(momentsRef); // Generate unique ID
      
      await set(newPostRef, {
        name: formData.name,
        message: formData.message,
        image: cloudData.secure_url,
        likes: 0,
        userId: user.uid,
        timestamp: rtdbTimestamp()
      });

      resetForm();
      setView('feed');

    } catch (error) {
      console.error("Submit Error:", error);
      let errMsg = error.message;
      if (error.name === 'AbortError') errMsg = "Koneksi lambat (Timeout). Coba lagi.";
      alert("Terjadi kesalahan: " + errMsg);
    } finally {
      setIsSubmitting(false);
      setStatusMessage("");
    }
  };

  const handleLike = async (postId) => {
    if(!user) return;
    const likeRef = ref(db, `moments/${postId}/likes`);
    // Transaction atomic update untuk counter
    runTransaction(likeRef, (currentLikes) => {
      return (currentLikes || 0) + 1;
    });
  };

  const handleComment = async (postId, text) => {
    if(!user || !text) return;
    const commentsRef = ref(db, `moments/${postId}/comments`);
    const newCommentRef = push(commentsRef);
    
    await set(newCommentRef, {
        user: "Peserta",
        text: text,
        time: rtdbTimestamp()
    });
  };

  const resetForm = () => {
    setCapturedImage(null);
    setFormData({ name: '', message: '' });
  };

  if (!isFirebaseInitialized) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-stone-50">
              <div className="text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <h2 className="text-xl font-bold text-stone-900">Konfigurasi Hilang</h2>
                  <p className="text-stone-500 mt-2 max-w-xs mx-auto">Tidak dapat menghubungkan ke database. Silakan refresh halaman.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="mx-auto max-w-md bg-white min-h-screen shadow-2xl overflow-hidden font-sans text-stone-900 relative">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      {view === 'feed' && (
        <FeedView 
          posts={posts} 
          setView={setView} 
          loading={loading}
          onLike={handleLike}
          onComment={handleComment}
        />
      )}
      {view === 'camera' && <CameraView onCapture={handleCapture} onClose={() => setView('feed')} fileInputRef={fileInputRef} />}
      {view === 'upload' && (
        <UploadView 
          capturedImage={capturedImage}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          statusMessage={statusMessage}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          setView={setView}
        />
      )}
    </div>
  );
}