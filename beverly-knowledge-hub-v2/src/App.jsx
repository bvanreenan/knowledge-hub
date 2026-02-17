import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { signInAnonymously, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection, onSnapshot, addDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy
} from 'firebase/firestore';
import {
  User, Cpu, HeartPulse, ShieldCheck, PenTool, Mail,
  ExternalLink, ChevronRight, Menu, X, Linkedin,
  MessageSquare, Scale, Activity, Award, ArrowLeft,
  ArrowRight, FileText, Camera, Layers, Target,
  Plus, Trash2, Lock, Settings, LogIn, Eye, EyeOff,
  Archive, Tag, Download, Filter, BookOpen, GraduationCap
} from 'lucide-react';

// ─── Allowed admin emails ──────────────────────────────────
// Add any email addresses that should have admin access.
// These must match accounts created in Firebase Authentication.
const ADMIN_EMAILS = [
  "bvanreenan1@gmail.com",
  // Add more emails here as needed:
  // "collaborator@example.com",
];

export default function App() {
  // ── State ────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPost, setSelectedPost] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Admin login form
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Blog
  const [posts, setPosts] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '', category: 'AI Strategy', excerpt: '',
    challenge: '', interdependence: '', outcome: ''
  });

  // Research Archive
  const [activeTags, setActiveTags] = useState([]);
  const [researchPapers, setResearchPapers] = useState([]);
  const [papersLoaded, setPapersLoaded] = useState(false);
  const [showPaperForm, setShowPaperForm] = useState(false);
  const [isPublishingPaper, setIsPublishingPaper] = useState(false);
  const [newPaper, setNewPaper] = useState({
    title: '', description: '', year: '2026', degree: 'MSIT',
    pdf: '', selectedTags: []
  });

  // ── Auth ─────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && u.email && ADMIN_EMAILS.includes(u.email.toLowerCase())) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        // If no user at all, sign in anonymously so visitors can read data
        if (!u) {
          signInAnonymously(auth).catch(err => console.error("Anonymous auth error:", err));
        }
      }
    });
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

  // ── Firestore: Research papers listener ────────────────
  useEffect(() => {
    if (!user) return;

    const papersRef = collection(db, 'papers');
    const q2 = query(papersRef, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q2, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setResearchPapers(data);
      setPapersLoaded(true);
    }, (err) => {
      console.error("Papers Firestore error:", err);
      setPapersLoaded(true);
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

  const publishPaper = async (e) => {
    e.preventDefault();
    if (!user || isPublishingPaper) return;
    setIsPublishingPaper(true);
    try {
      await addDoc(collection(db, 'papers'), {
        title: newPaper.title,
        description: newPaper.description,
        year: newPaper.year,
        degree: newPaper.degree,
        pdf: newPaper.pdf,
        tags: newPaper.selectedTags,
        createdAt: serverTimestamp()
      });
      setNewPaper({ title: '', description: '', year: '2026', degree: 'MSIT', pdf: '', selectedTags: [] });
      setShowPaperForm(false);
    } catch (err) {
      console.error("Paper publish error:", err);
      alert("Failed to publish paper. Check console for details.");
    } finally {
      setIsPublishingPaper(false);
    }
  };

  const deletePaper = async (id) => {
    if (!window.confirm("Delete this paper?")) return;
    try {
      await deleteDoc(doc(db, 'papers', id));
    } catch (err) {
      console.error("Paper delete error:", err);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setLoginEmail('');
      setLoginPassword('');
      setShowLoginModal(false);
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setLoginError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setLoginError('Too many attempts. Try again later.');
      } else {
        setLoginError('Login failed. Check console for details.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
      // After sign out, onAuthStateChanged will fire and sign in anonymously
    } catch (err) {
      console.error("Logout error:", err);
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
    { id: 'research', label: 'Research Archive' },
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

  // ── Research Archive ──────────────────────────────────────
  const allTags = [
    "AI / Ethics",
    "Systems Architecture",
    "Healthcare / Informatics",
    "Interoperability",
    "Governance",
    "Philosophy / Logic",
    "Explainable AI (XAI)",
  ];

  const toggleTag = (tag) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const togglePaperTag = (tag) => {
    setNewPaper(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  const filteredPapers = activeTags.length === 0
    ? researchPapers
    : researchPapers.filter(paper =>
        activeTags.some(tag => (paper.tags || []).includes(tag))
      );

  // ── Render: Research Archive ─────────────────────────────
  const renderResearch = () => (
    <div className="space-y-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl border-l-4 border-blue-800 pl-7">
          <h2 className="font-display text-4xl text-slate-900 mb-3">Research Archive</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Academic papers and analyses across philosophy, technology, and healthcare governance.
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowPaperForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-[0.15em] hover:bg-slate-900 transition-colors shrink-0">
            <Plus size={14} /> Add Paper
          </button>
        )}
      </div>

      {/* Tag Filter Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-slate-400">
          <Filter size={16} />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]">Filter by topic</span>
          {activeTags.length > 0 && (
            <button onClick={() => setActiveTags([])}
              className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer ml-2">
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {allTags.map(tag => {
            const isActive = activeTags.includes(tag);
            const count = researchPapers.filter(p => (p.tags || []).includes(tag)).length;
            return (
              <button key={tag} onClick={() => toggleTag(tag)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.12em] border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-900 text-white border-blue-900 shadow-lg shadow-blue-100'
                    : 'bg-white text-slate-500 border-slate-150 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {tag}
                <span className={`ml-2 text-[9px] ${isActive ? 'text-blue-200' : 'text-slate-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Showing {filteredPapers.length} of {researchPapers.length} papers
        {activeTags.length > 0 && (
          <span className="text-blue-600"> · {activeTags.length} tag{activeTags.length > 1 ? 's' : ''} active</span>
        )}
      </div>

      {/* Papers List */}
      <div className="flex flex-col gap-6">
        {!papersLoaded ? (
          <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            <Archive size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">Loading the Archive...</p>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            <Archive size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">{researchPapers.length === 0 ? 'No papers yet.' : 'No papers match the selected tags.'}</p>
            <p className="text-sm mt-1">
              {researchPapers.length === 0 && isAdmin
                ? 'Click "Add Paper" above to upload your first paper.'
                : 'Try selecting different tags or clear the filter.'}
            </p>
          </div>
        ) : (
          filteredPapers.map((paper) => (
            <div key={paper.id}
              className="group bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-7 items-start relative"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                <BookOpen size={22} className="text-blue-800" />
              </div>

              {/* Delete (admin only) */}
              {isAdmin && (
                <button
                  onClick={() => deletePaper(paper.id)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                  title="Delete paper"
                >
                  <Trash2 size={14} />
                </button>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {paper.degree}
                  </span>
                  <span className="text-slate-400 text-xs font-bold">{paper.year}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 leading-snug">{paper.title}</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed font-medium">{paper.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(paper.tags || []).map(tag => (
                    <span key={tag}
                      className={`px-2.5 py-1 rounded-lg text-[8px] font-extrabold uppercase tracking-[0.1em] border transition-colors cursor-pointer ${
                        activeTags.includes(tag)
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-blue-600'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {paper.pdf && (
                  <a href={paper.pdf} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 pt-2 text-blue-800 font-extrabold text-[10px] uppercase tracking-[0.2em] hover:gap-3 transition-all no-underline">
                    <Download size={14} /> Download PDF <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Topic Index */}
      {researchPapers.length > 0 && (
        <div className="bg-slate-50 p-8 md:p-10 rounded-[2rem] border border-slate-100">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-5 flex items-center gap-2">
            <Tag size={16} /> Topic Index
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allTags.map(tag => {
              const count = researchPapers.filter(p => (p.tags || []).includes(tag)).length;
              return (
                <button key={tag} onClick={() => { setActiveTags([tag]); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left p-4 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group/idx">
                  <p className="text-sm font-bold text-slate-700 group-hover/idx:text-blue-700 transition-colors">{tag}</p>
                  <p className="text-xs text-slate-400 mt-1">{count} paper{count !== 1 ? 's' : ''}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // ── Render: Paper Form Modal ─────────────────────────────
  const renderPaperForm = () => {
    if (!showPaperForm) return null;

    return (
      <div className="fixed inset-0 z-[200] bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) setShowPaperForm(false); }}>
        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 md:p-14 relative">
          <button onClick={() => setShowPaperForm(false)} className="absolute top-7 right-7 text-slate-400 hover:text-slate-900 transition-colors bg-transparent border-none cursor-pointer">
            <X />
          </button>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-7 flex items-center gap-3">
            <BookOpen className="text-blue-600" /> Add Research Paper
          </h2>

          <form onSubmit={publishPaper} className="space-y-5">
            <input
              placeholder="Paper Title"
              value={newPaper.title}
              onChange={e => setNewPaper({ ...newPaper, title: e.target.value })}
              required
              className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:outline-none text-sm"
            />
            <textarea
              placeholder="Brief description / abstract"
              value={newPaper.description}
              onChange={e => setNewPaper({ ...newPaper, description: e.target.value })}
              required
              className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:outline-none text-sm h-24 resize-y"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input
                placeholder="Year (e.g. 2026)"
                value={newPaper.year}
                onChange={e => setNewPaper({ ...newPaper, year: e.target.value })}
                required
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:outline-none text-sm"
              />
              <select
                value={newPaper.degree}
                onChange={e => setNewPaper({ ...newPaper, degree: e.target.value })}
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:outline-none text-sm"
              >
                <option>MSIT</option>
                <option>MSHA-I</option>
                <option>Philosophy</option>
              </select>
              <input
                placeholder="PDF URL (optional)"
                value={newPaper.pdf}
                onChange={e => setNewPaper({ ...newPaper, pdf: e.target.value })}
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:outline-none text-sm col-span-2 md:col-span-1"
              />
            </div>

            {/* Tag selector */}
            <div className="space-y-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Select Tags</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => {
                  const selected = newPaper.selectedTags.includes(tag);
                  return (
                    <button key={tag} type="button" onClick={() => togglePaperTag(tag)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.1em] border-2 transition-all cursor-pointer ${
                        selected
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {newPaper.selectedTags.length === 0 && (
                <p className="text-xs text-amber-500 font-medium">Select at least one tag</p>
              )}
            </div>

            <button type="submit" disabled={isPublishingPaper || newPaper.selectedTags.length === 0}
              className="w-full py-4 bg-blue-900 text-white rounded-2xl font-extrabold uppercase text-[11px] tracking-[0.15em] hover:bg-slate-900 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50">
              <Plus size={16} />
              {isPublishingPaper ? 'Publishing...' : 'Add to Archive'}
            </button>
          </form>
        </div>
      </div>
    );
  };

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
        {activeTab === 'research' && renderResearch()}
        {activeTab === 'blog' && renderBlog()}
        {activeTab === 'contact' && renderContact()}
      </main>

      {/* ── Admin Modal ─────────────────────────────────── */}
      {renderAdminModal()}
      {renderPaperForm()}

      {/* ── Login Modal ──────────────────────────────────── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 md:p-14 relative">
            <button onClick={() => { setShowLoginModal(false); setLoginError(''); }}
              className="absolute top-7 right-7 text-slate-400 hover:text-slate-900 transition-colors bg-transparent border-none cursor-pointer">
              <X />
            </button>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
              <Lock className="text-blue-600" /> Admin Login
            </h2>
            <p className="text-sm text-slate-400 mb-7">Sign in with your authorized email.</p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:outline-none text-sm"
                autoComplete="email"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:outline-none text-sm pr-12"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {loginError && (
                <p className="text-red-500 text-sm font-medium bg-red-50 px-4 py-3 rounded-xl">{loginError}</p>
              )}

              <button type="submit" disabled={isLoggingIn}
                className="w-full py-4 bg-blue-900 text-white rounded-2xl font-extrabold uppercase text-[11px] tracking-[0.15em] hover:bg-slate-900 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50">
                <LogIn size={16} />
                {isLoggingIn ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

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
                  <button onClick={() => setShowLoginModal(true)}
                    className="text-left text-slate-500 opacity-30 hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-bold text-xs uppercase tracking-wider">
                    <Lock size={12} /> Admin
                  </button>
                ) : (
                  <button onClick={handleAdminLogout}
                    className="text-green-600 hover:text-red-500 flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-bold text-xs uppercase tracking-wider transition-colors">
                    <LogIn size={12} /> Logout
                  </button>
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
