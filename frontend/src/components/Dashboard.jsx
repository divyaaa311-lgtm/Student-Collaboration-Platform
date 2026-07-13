import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function Dashboard() {
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState('Student'); 
  const [projects, setProjects] = useState([]); 

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
      const response = await axios.get('http://localhost:5000/api/projects');
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

    return () => {
      socket.off('projectCreated');
      socket.off('projectUpdated');
    };
  }, [navigate]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const currentUserId = localStorage.getItem('studentId') || "6a51f27ebe108d97fd20cc86";

      await axios.post('http://localhost:5000/api/projects', {
        title,
        description,
        skillsRequired: skills ? skills.split(',') : [], 
        creatorId: currentUserId,
        deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
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
      
      await axios.post(`http://localhost:5000/api/projects/${activeApplyProject._id}/apply`, {
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

  const filteredProjects = projects.filter((project) => {
    if (!project) return false;
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

      {/* DASHBOARD CORE LAYOUT CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* POST FORM PANEL (LEFT) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Post an Opportunity</h3>
            <p className="text-sm text-slate-500 mb-5">Fill in fields below to recruit your study team.</p>
            
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

        {/* FEED AND ADVANCED FILTERS PANEL (RIGHT) */}
        <div className="lg:col-span-2">
          
          {/* SEARCH & PILL FILTERS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs mb-6 space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">🔍</span>
              <input type="text" placeholder="Search projects by title or keywords..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" />
            </div>

            {allUniqueTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
                <button onClick={() => setSelectedTag('')} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${selectedTag === '' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All Skills</button>
                {allUniqueTags.map((tag, index) => (
                  <button key={index} onClick={() => setSelectedTag(tag)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${selectedTag.toLowerCase() === tag.toLowerCase() ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{tag}</button>
                ))}
              </div>
            )}
          </div>

          {/* PROJECT FEED HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Active Collaborations</h2>
            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">{filteredProjects.length} Found</span>
          </div>

          {/* FEED CARDS GRID */}
          <div className="space-y-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => {
                const hasExpired = project.deadline ? new Date() > new Date(project.deadline) : false;
                return (
                  <div key={project._id} className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all group relative ${hasExpired ? 'opacity-65 border-dashed border-rose-200' : 'border-slate-200'}`}>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${hasExpired ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-500'}`}>
                          {hasExpired ? '⚠️ Expired' : 'OPPORTUNITY'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          👤 {project.creator && typeof project.creator === 'object' ? project.creator.name : "Student"}
                        </span>
                      </div>
                      
                      <h4 className="text-base font-bold text-slate-900 mb-1">{project.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4">{project.description}</p>
                      
                      {project.deadline && (
                        <div className="text-xs text-slate-500 mb-4">
                          📅 Deadline: <span className={hasExpired ? "text-rose-600 font-bold" : "text-slate-800 font-semibold"}>{new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {project.skillsRequired && project.skillsRequired.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.skillsRequired.map((skill, index) => (
                            <button key={index} onClick={() => setSelectedTag(skill.trim())} className={`text-[11px] font-semibold px-2 py-1 rounded-md tracking-wide transition-all cursor-pointer ${selectedTag.toLowerCase() === skill.trim().toLowerCase() ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                              {skill.trim()}
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        disabled={hasExpired}
                        onClick={() => setActiveApplyProject(project)}
                        className={`w-full text-center text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer ${hasExpired ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs shadow-emerald-50'}`}
                      >
                        {hasExpired ? 'Closed' : 'Apply for Opportunity 🚀'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-slate-500 text-sm">No results match your search parameters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POPUP CONTAINER MODAL OVERLAY BOX */}
      {activeApplyProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-bold text-slate-900">Apply to Team</h3>
              <button onClick={() => setActiveApplyProject(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer transition-colors">✕</button>
            </div>
            
            <p className="text-xs text-indigo-600 font-medium mb-4">Registering interest for: "{activeApplyProject.title}"</p>
            
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">LinkedIn Profile Link URL</label>
                <input type="url" placeholder="https://linkedin.com/in/yourprofile" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" />
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