import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

function Dashboard() {
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState('Student'); 
  const [projects, setProjects] = useState([]); 

  // 1. Memory for Search and Filter values
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects`);
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
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
      alert(`Live Notification!\nA new project was just posted: "${newlyPostedProject.title}"`);
      setProjects((prevProjects) => [newlyPostedProject, ...prevProjects]);
    });

    return () => {
      socket.off('projectCreated');
    };
  }, [navigate]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const currentUserId = localStorage.getItem('studentId') || "6a51f27ebe108d97fd20cc86";

      await axios.post('http://localhost:5000/api/projects', {
        title,
        description,
        skillsRequired: skills.split(','), 
        creatorId: currentUserId 
      });

      setTitle('');
      setDescription('');
      setSkills('');
    } catch (err) {
      alert("Failed to post project.");
    }
  };

  // 2. THE SEARCH LOGIC: Filter projects instantly based on search text OR clicked tag
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === '' || project.skillsRequired.some(skill => 
      skill.trim().toLowerCase() === selectedTag.toLowerCase()
    );

    return matchesSearch && matchesTag;
  });

  // 3. Helper to extract all unique tags from available projects for quick filtering
  const allUniqueTags = Array.from(
    new Set(projects.flatMap(p => p.skillsRequired.map(s => s.trim())))
  ).filter(tag => tag !== '');

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <h1 className="text-xl font-bold tracking-tight text-indigo-600 sm:text-2xl">CollabHub</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden sm:inline text-slate-600">Welcome back, <strong className="text-slate-900">{userName}</strong>!</span>
          <button 
            onClick={() => { localStorage.removeItem('studentToken'); navigate('/'); }} 
            className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT SIDE: INPUT FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Post an Opportunity</h3>
            <p className="text-sm text-slate-500 mb-5">Looking for a team? Share your project details below.</p>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Project Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. AI Study Tool" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Project Goals</label>
                <textarea 
                  placeholder="Describe your goals..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-28 resize-none focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Required Skills</label>
                <input 
                  type="text" 
                  placeholder="React, Node, Python" 
                  value={skills} 
                  onChange={(e) => setSkills(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer shadow-md mt-2">
                Post Opportunity
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: FEED + SEARCH FILTERS */}
        <div className="lg:col-span-2">
          
          {/* SEARCH BOX AND FILTER BANNER */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs mb-6 space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">🔍</span>
              <input 
                type="text"
                placeholder="Search projects by title or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Quick Skills Filter Tags List */}
            {allUniqueTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
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
          </div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Active Collaborations</h3>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">{filteredProjects.length} Found</span>
          </div>
          
          {/* FEED CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div key={project._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all group">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">OPPORTUNITY</span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm font-medium">
                        👤 {project.creator && typeof project.creator === 'object' ? project.creator.name : "Student"}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">{project.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{project.description}</p>
                  </div>
                  
                  {/* Skill Badges Wrapper */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.skillsRequired && project.skillsRequired.map((skill, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTag(skill.trim())}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md tracking-wide transition-all cursor-pointer ${
                          selectedTag.toLowerCase() === skill.trim().toLowerCase() 
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {skill.trim()}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500">
                🔍 No results match your search or filter choice.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;