import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  collection, onSnapshot, addDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy
} from 'firebase/firestore';
import {
  User, Cpu, HeartPulse, ShieldCheck, PenTool, Mail,
  ExternalLink, ChevronRight, Menu, X, Linkedin,
  MessageSquare, Scale, Activity, Award, ArrowLeft,
  ArrowRight, FileText, Camera, Layers, Target,
  Plus, Trash2, Lock, Settings, LogIn, Eye, EyeOff
} from 'lucide-react';

// ─── Simple admin password (change this!) ──────────────────
const ADMIN_PASSWORD = "bev2026";

export default function App() {
  // ── State ────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPost, setSelectedPost] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Admin
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Blog
  const [posts, setPosts] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '', category: 'AI Strategy', excerpt: '',
    challenge: '', interdependence: '', outcome: ''
  });

  // ── Auth ─────────────────────────────────────────────────
  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Auth error:", err));
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // ── Firestore realtime listener ──────────────────────────
  useEffect(() => {
    if (!user) return;

    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(data);
      setPostsLoaded(true);
    }, (err) => {
      console.error("Firestore error:", err);
      setPostsLoaded(true);
    });

    return () => unsub();
  }, [user]);

  // ── Scroll ───────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Actions ──────────────────────────────────────────────
  const publishPost = async (e) => {
    e.preventDefault();
    if (!user || isPublishing) return;
    setIsPublishing(true);
    try {
      await addDoc(collection(db, 'posts'), {
        ...newPost,
        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        createdAt: serverTimestamp()
      });
      setNewPost({ title: '', category: 'AI Strategy', excerpt: '', challenge: '', interdependence: '', outcome: '' });
      setShowAdmin(false);
    } catch (err) {
      console.error("Publish error:", err);
      alert("Failed to publish. Check console for details.");
    } finally {
      setIsPublishing(false);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm("Delete this analysis?")) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
      if (selectedPost?.id === id) setSelectedPost(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setAdminInput('');
    } else {
      alert("Incorrect password.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ── Data ─────────────────────────────────────────────────
  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'expertise', label: 'Strategic Synthesis' },
    { id: 'blog', label: 'The Thought Lab' },
    { id: 'contact', label: 'Connect' },
  ];

  const linkedinUrl = "https://www.linkedin.com/in/beverly-vanreenan";

  const degreePillars = [
    {
      title: "Philosophy & Logic",
      degree: "The Theory of Knowledge",
      icon: <Scale className="text-blue-900" size={28} />,
      description: "Interrogating the foundations of inquiry and human behavior to establish stable, ethical frameworks — utilizing the Veil of Ignorance — to ensure equitable system architecture.",
      tags: ["Epistemology", "Predictive Ethics", "Logic"],
    },
    {
      title: "MSIT & Explainable AI",
      degree: "Systems Integrity",
      icon: <Cpu className="text-blue-700" size={28} />,
      description: "Architecting transparent neural networks and XAI workflows that prioritize accountability, reducing variation between machine output and human intent.",
      tags: ["Explainable AI (XAI)", "Recursive Prompting", "CER Framework"],
    },
    {
      title: "MSHA-I & Health Governance",
      degree: "Master of Health Admin",
      icon: <HeartPulse className="text-blue-500" size={28} />,
      description: "Managing the interdependence of clinical informatics and operational performance to ensure high-fidelity outcomes in patient-centric systems.",
      tags: ["Clinical Outcomes", "Data Integrity", "Strategy"],
    },
  ];

  // ── Render: Overview ─────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-20 animate-fade-in-up">
      {/* Hero */}
      <section className="flex flex-col lg:flex-row items-center gap-16 py-8">
        <div className="flex-1 space-y-7 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 border border-blue-100 rounded-full text-blue-900 text-[10px] font-extrabold uppercase tracking-[0.2em]">
            <Award size={14} className="text-blue-600" />
            Thinker · Technologist · Ethicist
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-slate-900 tracking-tight leading-[1.06]">
            Strategic <span className="text-blue-800">Synthesis</span>
            <br />for <span className="text-blue-600">Total System</span> Value.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl font-medium">
            Integrating Philosophy, MSIT, and MSHA-I to manage the interdependence of
            technology, psychology, and logic in high-stakes healthcare and AI environments.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <button onClick={() => setActiveTab('expertise')}
              className="px-8 py-4 bg-blue-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 hover:-translate-y-0.5">
              Strategic Competencies
            </button>
            <button onClick={() => setActiveTab('blog')}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:border-blue-600 hover:text-blue-700 transition-all">
              View Analysis
            </button>
          </div>
        </div>

        {/* Portrait */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-900 to-blue-400 rounded-[2.5rem] opacity-15 blur-3xl group-hover:opacity-25 transition-opacity" />
          <div className="w-72 h-80 md:w-80 md:h-[400px] bg-white border border-slate-100 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          
              <img src="/headshot.jpg" alt="Beverly VanReenan" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                  <User size={40} className="text-slate-200" />
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Portrait Placeholder</p>
                {isAdmin && (
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-[0.15em] cursor-pointer hover:bg-blue-800 transition-colors shadow-lg shadow-blue-100">
                    <Camera size={14} /> Upload Headshot
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                )}
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 p-7 bg-gradient-to-t from-slate-900/85 to-transparent text-white">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.35em] opacity-80 mb-1">Architecture</p>
              <p className="text-base font-bold">Inquiry · Systems · Outcomes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Cards */}
      <div className="grid md:grid-cols-3 gap-7">
        {degreePillars.map((p, i) => (
          <div key={i} className={`group p-10 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 animate-fade-in-up animate-delay-${(i + 1) * 100}`}>
            <div className="p-3.5 bg-slate-50 w-fit rounded-2xl mb-7 group-hover:bg-blue-50 transition-colors">
              {p.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1.5">{p.title}</h3>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-blue-600 opacity-70 mb-4">{p.degree}</p>
            <p className="text-slate-500 mb-7 leading-relaxed font-medium italic text-[15px]">"{p.description}"</p>
            <div className="flex flex-wrap gap-2">
              {p.tags.map(tag => (
                <span key={tag} className="px-3.5 py-1.5 bg-blue-50 text-blue-800 text-[9px] font-extrabold uppercase tracking-[0.15em] rounded-lg border border-blue-100/50">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Render: Expertise ────────────────────────────────────
  const renderExpertise = () => (
    <div className="space-y-14 animate-fade-in-up">
      <div className="max-w-2xl border-l-4 border-blue-800 pl-7">
        <h2 className="font-display text-4xl text-slate-900 mb-3">Systematic Competency</h2>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">
          Prioritizing technical architecture, Explainable AI (XAI), and the organizational psychology of trust.
        </p>
      </div>
      <div className="flex flex-col gap-7">
        {degreePillars.map((item, idx) => (
          <div key={idx} className="bg-white p-11 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-9 items-start hover:border-blue-200 transition-colors">
            <div className="w-14 h-14 bg-blue-900 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
              <ShieldCheck size={28} />
            </div>
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-500 text-base leading-relaxed font-medium">{item.description}</p>
              <div className="flex flex-wrap gap-2.5">
                {item.tags.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-slate-50 border border-slate-100 text-blue-900 text-xs font-bold rounded-xl">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Render: Blog ─────────────────────────────────────────
  const renderBlogPost = () => (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in-up">
      <button onClick={() => setSelectedPost(null)}
        className="flex items-center gap-2 text-blue-800 font-extrabold text-[11px] uppercase tracking-[0.2em] hover:gap-4 transition-all bg-transparent border-none cursor-pointer">
        <ArrowLeft size={16} /> Back to Lab
      </button>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-blue-800 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">{selectedPost.category}</span>
          <span className="text-slate-400 text-xs font-bold">{selectedPost.date}</span>
        </div>
        <h2 className="font-display text-4xl md:text-5xl text-slate-900 leading-tight">{selectedPost.title}</h2>
        <p className="text-xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-blue-100 pl-7">{selectedPost.excerpt}</p>
      </div>
      <div className="flex flex-col gap-8 pt-4">
        <div className="bg-slate-50 p-10 rounded-[2rem] space-y-3">
          <h4 className="text-blue-900 font-extrabold uppercase tracking-[0.2em] text-xs flex items-center gap-2"><Target size={18} /> The Challenge</h4>
          <p className="text-slate-600 text-base leading-relaxed font-medium">{selectedPost.challenge}</p>
        </div>
        <div className="bg-blue-50 p-10 rounded-[2rem] space-y-3">
          <h4 className="text-blue-900 font-extrabold uppercase tracking-[0.2em] text-xs flex items-center gap-2"><Layers size={18} /> The Interdependence</h4>
          <p className="text-slate-600 text-base leading-relaxed font-medium">{selectedPost.interdependence}</p>
        </div>
        <div className="bg-white border-2 border-blue-900 p-10 rounded-[2rem] space-y-3 shadow-xl">
          <h4 className="text-blue-900 font-extrabold uppercase tracking-[0.2em] text-xs flex items-center gap-2"><Activity size={18} /> The Strategic Outcome</h4>
          <p className="text-slate-900 text-base leading-relaxed font-semibold">{selectedPost.outcome}</p>
        </div>
      </div>
    </div>
  );

  const renderBlog = () => {
    if (selectedPost) return renderBlogPost();

    return (
      <div className="space-y-12 animate-fade-in-up">
        <div className="border-b border-slate-100 pb-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl text-slate-900 mb-3">The Thought Lab</h2>
            <p className="text-slate-500 text-lg font-medium">Analyzing technical systems and organizational trust.</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowAdmin(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-[0.15em] hover:bg-slate-900 transition-colors">
              <Plus size={14} /> New Analysis
            </button>
          )}
        </div>

        <div className="flex flex-col gap-7">
          {!postsLoaded ? (
            <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">Loading the Laboratory...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">The Laboratory is currently initializing...</p>
              <p className="text-sm mt-1">Connect via the Admin panel to publish your first analysis.</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} onClick={() => setSelectedPost(post)}
                className="group cursor-pointer bg-white p-10 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col md:flex-row gap-8 items-start relative">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-500 text-blue-800">
                  <PenTool size={20} />
                </div>

                {/* Delete (admin only) */}
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                    title="Delete post"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-blue-800 bg-blue-50 px-4 py-1 rounded-full border border-blue-100">{post.category}</span>
                    <span className="text-slate-400 text-xs font-bold">{post.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">{post.title}</h3>
                  <p className="text-slate-500 text-base leading-relaxed font-medium max-w-2xl">{post.excerpt}</p>
                  <div className="pt-3 flex items-center text-blue-800 font-extrabold text-[10px] uppercase tracking-[0.2em] gap-2 group-hover:gap-4 transition-all">
                    Access Analysis <ArrowRight size={16} />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    );
  };

  // ── Render: Contact ──────────────────────────────────────
  const renderContact = () => (
    <div className="max-w-3xl mx-auto bg-slate-950 p-12 md:p-20 rounded-[3rem] text-white relative overflow-hidden shadow-2xl animate-fade-in-up">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="relative z-10 space-y-7">
        <h2 className="font-display text-5xl md:text-6xl leading-none">
          Initiate <span className="text-blue-400">Analysis.</span>
        </h2>
        <p className="text-blue-200/70 text-lg font-medium leading-relaxed max-w-md">
          Available for strategic consultations in AI Governance, Health Systems Architecture, and Philosophical Logic.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white text-slate-950 px-7 py-4 rounded-2xl font-extrabold uppercase text-[11px] tracking-[0.15em] hover:bg-blue-50 transition-colors no-underline">
            <Linkedin size={18} /> LinkedIn
          </a>
          <a href="mailto:contact@beverlyvanreenan.com"
            className="flex items-center gap-3 bg-blue-800 text-white px-7 py-4 rounded-2xl font-extrabold uppercase text-[11px] tracking-[0.15em] hover:bg-blue-700 transition-colors no-underline">
            <MessageSquare size={18} /> Professional Inquiry
          </a>
        </div>
      </div>
    </div>
  );

  // ── Admin Modal ──────────────────────────────────────────
  const renderAdminModal = () => {
    if (!showAdmin) return null;

    return (
      <div className="fixed inset-0 z-[200] bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) setShowAdmin(false); }}>
        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 md:p-14 relative">
          <button onClick={() => setShowAdmin(false)} className="absolute top-7 right-7 text-slate-400 hover:text-slate-900 transition-colors bg-transparent border-none cursor-pointer">
            <X />
          </button>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-7 flex items-center gap-3">
            <Settings className="text-blue-600" /> Publish Analysis
          </h2>

          <form onSubmit={publishPost} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <input
                placeholder="Analysis Title"
                value={newPost.title}
                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                required
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:outline-none text-sm"
              />
              <select
                value={newPost.category}
                onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:outline-none text-sm"
              >
                <option>AI Strategy</option>
                <option>Healthcare Governance</option>
                <option>Philosophy & Logic</option>
                <option>Systems Architecture</option>
              </select>
            </div>
            {[
              { key: 'excerpt', ph: 'Hook / Excerpt (displayed on list view)' },
              { key: 'challenge', ph: 'The Challenge (Epistemology / Context)' },
              { key: 'interdependence', ph: 'The Interdependence (Systems / Logic)' },
              { key: 'outcome', ph: 'Strategic Outcome (The Result)' },
            ].map(f => (
              <textarea
                key={f.key}
                placeholder={f.ph}
                value={newPost[f.key]}
                onChange={e => setNewPost({ ...newPost, [f.key]: e.target.value })}
                required
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:outline-none text-sm h-20 resize-y"
              />
            ))}
            <button type="submit" disabled={isPublishing}
              className="w-full py-4 bg-blue-900 text-white rounded-2xl font-extrabold uppercase text-[11px] tracking-[0.15em] hover:bg-slate-900 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50">
              <Plus size={16} />
              {isPublishing ? 'Publishing...' : 'Publish to Thought Lab'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // ── Main Render ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg py-4' : 'bg-transparent py-8 md:py-10'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => { setActiveTab('overview'); setSelectedPost(null); }}>
            <div className="w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center text-white group-hover:rotate-6 transition-transform shadow-lg shadow-blue-200/30">
              <Layers size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-lg font-extrabold tracking-wide uppercase">STRATEGIC</span>
              <span className="text-[8px] font-extrabold text-blue-600 tracking-[0.4em] uppercase opacity-70 italic">Logic · Systems · Outcomes</span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex gap-10 items-center">
            {navLinks.map(link => (
              <button key={link.id}
                onClick={() => { setActiveTab(link.id); setSelectedPost(null); }}
                className={`text-[10px] font-extrabold uppercase tracking-[0.2em] transition-all py-2 border-b-[3px] bg-transparent cursor-pointer ${
                  activeTab === link.id ? 'text-blue-900 border-blue-900' : 'text-slate-400 border-transparent hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden bg-transparent border-none cursor-pointer text-slate-600">
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-6 flex flex-col gap-4 shadow-xl">
            {navLinks.map(link => (
              <button key={link.id}
                onClick={() => { setActiveTab(link.id); setSelectedPost(null); setMobileMenu(false); }}
                className={`text-left text-sm font-bold uppercase tracking-wider py-2 bg-transparent border-none cursor-pointer ${
                  activeTab === link.id ? 'text-blue-900' : 'text-slate-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── Main Content ────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-40 md:pt-44 pb-28">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'expertise' && renderExpertise()}
        {activeTab === 'blog' && renderBlog()}
        {activeTab === 'contact' && renderContact()}
      </main>

      {/* ── Admin Modal ─────────────────────────────────── */}
      {renderAdminModal()}

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="bg-slate-50 border-t border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-5">
            <div className="text-xl font-extrabold uppercase italic tracking-wider underline decoration-blue-600 decoration-4 underline-offset-8">AUTHORITY.</div>
            <p className="text-slate-500 text-[13px] max-w-xs font-medium leading-relaxed italic">
              "The synthesis of philosophy, technology, and governance is the only way to manage the interdependence of high-stakes systems."
            </p>
          </div>
          <div className="flex gap-16">
            <div className="space-y-5">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-slate-400">Pillars</p>
              <div className="flex flex-col gap-3.5 font-bold text-xs text-slate-500 uppercase tracking-wider">
                <span>Philosophy</span><span>MSIT</span><span>MSHA-I</span>
              </div>
            </div>
            <div className="space-y-5">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-slate-400">Focus</p>
              <div className="flex flex-col gap-3.5 font-bold text-xs uppercase tracking-wider">
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors no-underline">LinkedIn</a>
                {!isAdmin ? (
                  <button onClick={() => {
                    const pw = window.prompt("Enter admin password:");
                    if (pw === ADMIN_PASSWORD) setIsAdmin(true);
                    else if (pw !== null) alert("Incorrect password.");
                  }}
                    className="text-left text-slate-500 opacity-30 hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-bold text-xs uppercase tracking-wider">
                    <Lock size={12} /> Admin
                  </button>
                ) : (
                  <button onClick={() => setIsAdmin(false)}
				  className="text-green-600 hover:text-red-500 flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-bold text-xs uppercase tracking-wider transition-colors">
                    <LogIn size={12} /> Logout
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-8 mt-16 pt-6 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.3em]">
          <span>© {new Date().getFullYear()} Intellectual Portfolio</span>
          <span className="text-blue-700 underline italic">Architecture · Resilience · Outcomes</span>
        </div>
      </footer>
    </div>
  );
}
