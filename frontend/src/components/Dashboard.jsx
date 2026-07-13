import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_BASE);

function Dashboard() {
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState('Student'); 
  const [projects, setProjects] = useState([]); 

  // View state toggle: 'all' shows everything, 'mine' shows only user's posts
  const [viewMode, setViewMode] = useState('all');

  // Search, tag, and modal tracking memory layers
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [activeApplyProject, setActiveApplyProject] = useState(null);

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
      const response = await axios.get(`${API_BASE}/api/projects`);
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

    // 🚀 Socket listener for deletions: wipes the card instantly without reload
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
    try {
      const currentUserId = localStorage.getItem('studentId');

      await axios.post(`${API_BASE}/api/projects`, {
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
      alert("❌ Failed to post project.");
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      const savedEmail = localStorage.getItem('studentEmail') || 'test@college.edu';
      
      await axios.post(`${API_BASE}/api/projects/${activeApplyProject._id}/apply`, {
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
    }
  };

  // 🗑️ FUNCTION TO DELETE A POST FROM THE DB
  const handleDeleteProject = async (projectId) => {
    if (window.confirm("⚠️ Are you sure you want to delete this opportunity permanentely?")) {
      try {
        await axios.delete(`${API_BASE}/api/projects/${projectId}`);
        alert("🗑️ Post deleted successfully!");
        fetchProjects();
      } catch (err) {
        alert("❌ Failed to remove post.");
      }
    }
  };

  const currentUserId = localStorage.getItem('studentId');

  // Filter projects based on search query, tags, AND view mode choice
  const filteredProjects = projects.filter((project) => {
    if (!project) return false;
    
    // View mode filter
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
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 relative">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <h1 className="text-xl font-bold tracking-tight text-indigo-600 sm:text-2xl">CollabHub</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden sm:inline text-slate-600">Welcome back, <strong className="text-slate-900">{userName}</strong>!</span>
          <button onClick={() => { localStorage.removeItem('studentToken'); navigate('/'); }} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">Logout</button>
        </div>
      </nav>

      {/* CORE LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL (LEFT) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Post an Opportunity</h3>
            <p className="text-sm text-slate-500 mb-5">Recruit your student dream team.</p>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Project Title</label>
                <input type="text" placeholder="e.g. AI Study Tool" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Project Goals</label>
                <textarea placeholder="Describe your goals..." value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-24 resize-none focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Required Skills</label>
                <input type="text" placeholder="React, Node, Python" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Application Deadline</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700 cursor-pointer" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer shadow-md mt-2">Post Opportunity</button>
            </form>
          </div>
        </div>

        {/* FEED PANEL (RIGHT) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 🔘 VIEW TOGGLE CONTROLLER BAR */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl max-w-xs shadow-inner">
            <button 
              onClick={() => setViewMode('all')} 
              className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              🌐 All Feeds
            </button>
            <button 
              onClick={() => setViewMode('mine')} 
              className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === 'mine' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              📂 My Posts
            </button>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-full">
            <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔍</span>
            <input 
              type="text" 
              placeholder="Search projects by title or keywords..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" 
            />
          </div>

          {/* TAG FILTERS */}
          {allUniqueTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 border border-slate-100 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Filter:</span>
              <button 
                onClick={() => setSelectedTag('')} 
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${selectedTag === '' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                All Skills
              </button>
              {allUniqueTags.map((tag, index) => (
                <button 
                  key={index} 
                  onClick={() => setSelectedTag(tag)} 
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${selectedTag.toLowerCase() === tag.toLowerCase() ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* FEED LIST HEADER */}
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-slate-900">
              {viewMode === 'all' ? 'Active Collaborations' : 'My Posted Opportunities'}
            </h2>
            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">
              {filteredProjects.length} Cards
            </span>
          </div>

          {/* FEED GRID */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => {
                const hasExpired = project.deadline ? new Date() > new Date(project.deadline) : false;
                const isOwner = project.creator?._id === currentUserId || project.creator === currentUserId;
                
                return (
                  <div 
                    key={project._id} 
                    className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all group relative ${hasExpired ? 'opacity-65 border-dashed border-rose-200' : 'border-slate-200'}`}
                  >
                    {/* CARD TOP BAR */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${hasExpired ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-500'}`}>
                        {hasExpired ? '⚠️ Expired' : 'OPPORTUNITY'}
                      </span>
                      
                      {isOwner ? (
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="text-rose-500 hover:text-rose-700 bg-rose-50 p-1.5 rounded-lg text-sm transition-all cursor-pointer"
                          title="Delete this listing"
                        >
                          🗑️
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">
                          👤 {project.creator?.name || "Student"}
                        </span>
                      )}
                    </div>

                    {/* DETAILS */}
                    <h3 className="text-base font-bold text-slate-900 mb-1">{project.title}</h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">{project.description}</p>
                    
                    {project.deadline && (
                      <p className="text-xs text-slate-500 mb-3">
                        📅 Deadline: <span className={hasExpired ? "text-rose-600 font-bold" : "text-slate-800 font-semibold"}>{new Date(project.deadline).toLocaleDateString()}</span>
                      </p>
                    )}

                    {/* SKILLS CONTAINER */}
                    {project.skillsRequired && project.skillsRequired.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.skillsRequired.map((skill, index) => (
                          <button 
                            key={index} 
                            onClick={() => setSelectedTag(skill.trim())} 
                            className={`text-[11px] font-semibold px-2 py-1 rounded-md tracking-wide transition-all cursor-pointer ${selectedTag.toLowerCase() === skill.trim().toLowerCase() ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}
                          >
                            {skill.trim()}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ACTION BUTTON */}
                    {!isOwner && (
                      <button
                        disabled={hasExpired}
                        onClick={() => setActiveApplyProject(project)}
                        className={`w-full text-center text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer ${hasExpired ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'}`}
                      >
                        {hasExpired ? 'Closed' : 'Apply for Opportunity 🚀'}
                      </button>
                    )}

                    {/* APPLICANT REVIEW GRID (Visible only if applicants exist) */}
                    {project.applicants && project.applicants.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          📥 Applications ({project.applicants.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {project.applicants.map((applicant, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-800">{applicant.studentName}</span>
                                <span className="text-slate-500 text-[11px]">{applicant.studentEmail}</span>
                              </div>
                              {applicant.linkedinUrl && (
                                <a href={applicant.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold block mb-1.5">
                                  🔗 LinkedIn ↗
                                </a>
                              )}
                              <p className="text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">"{applicant.introduction}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-400">
                <span className="text-3xl block mb-2">📁</span>
                No results found in this view category.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POPUP MODAL */}
      {activeApplyProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Apply to Team</h3>
              <button onClick={() => setActiveApplyProject(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">✕</button>
            </div>
            
            <p className="text-sm text-slate-500 mb-4">Registering interest for: <strong className="text-indigo-600">"{activeApplyProject.title}"</strong></p>
            
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">LinkedIn Profile Link URL</label>
                <input type="url" placeholder="https://linkedin.com/in/username" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Self-Introduction & Pitch</label>
                <textarea placeholder="Why do you want to join? Highlight your key skills..." value={introduction} onChange={(e) => setIntroduction(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-28 resize-none focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer shadow-md mt-2">Submit Application 📨</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;