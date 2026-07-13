import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Note: Ensure your local import matches 'axios' or leave as standard 'axios'
import { io } from 'socket.io-client';

// ✅ Ensure your fetches look like this:
const response = await axios.get(`${API_BASE}/api/projects`);
 // Fallback to standard axios
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_BASE);

function Dashboard() {
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState('Student'); 
  const [projects, setProjects] = useState([]); 
  const [viewMode, setViewMode] = useState('all');

  // Search, tag, and modal tracking memory layers
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [activeApplyProject, setActiveApplyProject] = useState(null);

  // Dynamic UX Loading triggers
  const [isPosting, setIsPosting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Form parameters for creating a brand new post
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [deadline, setDeadline] = useState(''); 

  // Form parameters for submitting an application
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [introduction, setIntroduction] = useState('');

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE}/api/projects`);
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/');
    } else {
      const savedName = localStorage.getItem('studentName') || 'Student';
      setUserName(savedName); 
      fetchProjects(); 
    }

    socket.on('projectCreated', (newlyPostedProject) => {
      alert(`📢 Live Notification!\nA new project was just posted: "${newlyPostedProject.title}"`);
      setProjects((prevProjects) => [newlyPostedProject, ...prevProjects]);
    });

    socket.on('projectUpdated', (updatedProject) => {
      setProjects((prevProjects) => 
        prevProjects.map((p) => p._id === updatedProject._id ? updatedProject : p)
      );
    });

    socket.on('projectDeleted', (deletedProjectId) => {
      setProjects((prevProjects) => prevProjects.filter((p) => p._id !== deletedProjectId));
    });

    return () => {
      socket.off('projectCreated');
      socket.off('projectUpdated');
      socket.off('projectDeleted');
    };
  }, [navigate]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setIsPosting(true); 
    try {
      const currentUserId = localStorage.getItem('studentId');

      await axiosInstance.post(`${API_BASE}/api/projects`, {
        title,
        description,
        skillsRequired: skills ? skills.split(',').map(s => s.trim()) : [], 
        creatorId: currentUserId,
        deadline: deadline || null
      });

      setTitle('');
      setDescription('');
      setSkills('');
      setDeadline('');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "❌ Failed to post project.");
    } finally {
      setIsPosting(false); 
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setIsApplying(true); 
    try {
      const savedEmail = localStorage.getItem('studentEmail') || 'test@college.edu';
      
      await axiosInstance.post(`${API_BASE}/api/projects/${activeApplyProject._id}/apply`, {
        studentName: userName,
        studentEmail: savedEmail,
        linkedinUrl,
        introduction
      });

      alert("🎉 Application submitted successfully!");
      setLinkedinUrl('');
      setIntroduction('');
      setActiveApplyProject(null); 
      fetchProjects();
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.message || "Application submission failed"}`);
    } finally {
      setIsApplying(false); 
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("⚠️ Are you sure you want to delete this opportunity permanentely?")) {
      try {
        await axiosInstance.delete(`${API_BASE}/api/projects/${projectId}`);
        alert("🗑️ Post deleted successfully!");
        fetchProjects();
      } catch (err) {
        alert("❌ Failed to remove post.");
      }
    }
  };

  const currentUserId = localStorage.getItem('studentId');

  const filteredProjects = projects.filter((project) => {
    if (!project) return false;
    
    if (viewMode === 'mine' && project.creator?._id !== currentUserId && project.creator !== currentUserId) {
      return false;
    }

    const titleText = project.title || '';
    const descText = project.description || '';
    
    const matchesSearch = 
      titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      descText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === '' || (project.skillsRequired && project.skillsRequired.some(skill => 
      skill.trim().toLowerCase() === selectedTag.toLowerCase()
    ));

    return matchesSearch && matchesTag;
  });

  const allUniqueTags = Array.from(
    new Set(projects.flatMap(p => p?.skillsRequired ? p.skillsRequired.map(s => s.trim()) : []))
  ).filter(tag => tag !== '');

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100 relative">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl bg-indigo-500/10 p-1.5 rounded-xl border border-indigo-500/20">🚀</span>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white sm:text-xl">CollabHub</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden sm:inline text-slate-400">Welcome back, <strong className="text-white">{userName}</strong>!</span>
          <button 
            onClick={() => { localStorage.removeItem('studentToken'); navigate('/'); }} 
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-md shadow-rose-900/20"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* CORE LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORM PANEL (LEFT) */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl sticky top-24">
            <h3 className="text-lg font-bold text-white mb-1">Post an Opportunity</h3>
            <p className="text-xs text-slate-400 mb-5">Recruit your student dream team layout.</p>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Project Title</label>
                <input type="text" placeholder="e.g. AI Study Tool" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Project Goals</label>
                <textarea placeholder="Describe your goals..." value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 h-24 resize-none focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Required Skills</label>
                <input type="text" placeholder="React, Node, Python" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Application Deadline</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer" style={{ colorScheme: 'dark' }} />
              </div>
              
              <button 
                type="submit" 
                disabled={isPosting}
                className={`w-full text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md mt-2 ${isPosting ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/30'}`}
              >
                {isPosting ? 'Uploading Listing...' : 'Post Opportunity'}
              </button>
            </form>
          </div>
        </div>

        {/* FEED PANEL (RIGHT) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* VIEW TOGGLE BAR */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl max-w-xs shadow-inner">
            <button 
              onClick={() => setViewMode('all')} 
              className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🌐 All Feeds
            </button>
            <button 
              onClick={() => setViewMode('mine')} 
              className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === 'mine' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              📂 My Posts
            </button>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-full">
            <span className="absolute left-4 top-3.5 text-slate-500 text-sm">🔍</span>
            <input 
              type="text" 
              placeholder="Search projects by title or keywords..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all" 
            />
          </div>

          {/* SKILLS TAG FILTER */}
          {allUniqueTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-3 border border-slate-800 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">Filter:</span>
              <button 
                onClick={() => setSelectedTag('')} 
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${selectedTag === '' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'}`}
              >
                All Skills
              </button>
              {allUniqueTags.map((tag, index) => (
                <button 
                  key={index} 
                  onClick={() => setSelectedTag(tag)} 
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${selectedTag.toLowerCase() === tag.toLowerCase() ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* SECTION HEADER */}
          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-bold text-slate-200">
              {viewMode === 'all' ? 'Active Collaborations' : 'My Posted Opportunities'}
            </h2>
            <span className="text-[11px] font-bold bg-slate-800 text-indigo-400 px-2.5 py-1 rounded-full border border-slate-700">
              {filteredProjects.length} Cards
            </span>
          </div>

          {/* FEED GRID */}
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => {
                const hasExpired = project.deadline ? new Date() > new Date(project.deadline) : false;
                const isOwner = project.creator?._id === currentUserId || project.creator === currentUserId;
                
                return (
                  <div 
                    key={project._id} 
                    className={`bg-slate-900 border rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all group relative ${hasExpired ? 'opacity-50 border-dashed border-rose-950' : 'border-slate-800'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${hasExpired ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                        {hasExpired ? '⚠️ Expired' : 'OPPORTUNITY'}
                      </span>
                      {isOwner ? (
                        <button 
                          onClick={() => handleDeleteProject(project._id)} 
                          className="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1" 
                          title="Delete this listing"
                        >
                          🗑️ Delete
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">👤 {project.creator?.name || "Student"}</span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white mb-1">{project.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{project.description}</p>
                    
                    {project.deadline && (
                      <p className="text-xs text-slate-500 mb-3">
                        📅 Deadline: <span className={hasExpired ? "text-rose-400 font-bold" : "text-slate-300 font-semibold"}>{new Date(project.deadline).toLocaleDateString()}</span>
                      </p>
                    )}

                    {project.skillsRequired && project.skillsRequired.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.skillsRequired.map((skill, index) => (
                          <button 
                            key={index} 
                            onClick={() => setSelectedTag(skill.trim())} 
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${selectedTag.toLowerCase() === skill.trim().toLowerCase() ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                          >
                            {skill.trim()}
                          </button>
                        ))}
                      </div>
                    )}

                    {!isOwner && (
                      <button 
                        disabled={hasExpired} 
                        onClick={() => setActiveApplyProject(project)} 
                        className={`w-full text-center text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer ${hasExpired ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/30' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-950/20'}`}
                      >
                        {hasExpired ? 'Closed' : 'Apply for Opportunity 🚀'}
                      </button>
                    )}

                    {/* APPLICANT REVIEW GRID */}
                    {project.applicants && project.applicants.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">📥 Applications ({project.applicants.length})</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {project.applicants.map((applicant, i) => (
                            <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-300">{applicant.studentName}</span>
                                <span className="text-slate-500 text-[11px]">{applicant.studentEmail}</span>
                              </div>
                              {applicant.linkedinUrl && (
                                <a href={applicant.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline font-semibold block mb-1">🔗 LinkedIn ↗</a>
                              )}
                              <p className="text-slate-400 italic bg-slate-900 p-2 rounded-lg border border-slate-800">"{applicant.introduction}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
                <span className="text-3xl block mb-2">📁</span>
                No results found in this view category.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POPUP MODAL */}
      {activeApplyProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Apply to Team</h3>
              <button onClick={() => setActiveApplyProject(null)} className="text-slate-500 hover:text-slate-300 font-bold text-sm cursor-pointer">✕</button>
            </div>
            
            <p className="text-sm text-slate-400 mb-4">Registering interest for: <strong className="text-indigo-400">"{activeApplyProject.title}"</strong></p>
            
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">LinkedIn Profile Link URL</label>
                <input type="url" placeholder="https://linkedin.com/in/username" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Self-Introduction & Pitch</label>
                <textarea placeholder="Why do you want to join? Highlight your key skills..." value={introduction} onChange={(e) => setIntroduction(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 h-28 resize-none focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              
              <button 
                type="submit"
                disabled={isApplying}
                className={`w-full text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md mt-2 ${isApplying ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isApplying ? 'Sending Details...' : 'Submit Application 📨'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;