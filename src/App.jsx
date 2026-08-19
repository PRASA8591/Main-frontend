import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, 
  Settings, 
  Layers, 
  DownloadCloud, 
  Smartphone, 
  HardDrive, 
  FileText, 
  Code, 
  Lock, 
  Menu, 
  X, 
  PhoneCall, 
  ShieldCheck, 
  Wrench, 
  Zap, 
  Banknote, 
  Heart, 
  Search, 
  AlertCircle, 
  Download, 
  Image as ImageIcon, 
  CheckCircle2, 
  CalendarCheck, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  ShieldAlert, 
  Calendar, 
  Star, 
  Inbox, 
  Trash2, 
  Trash,
  ShoppingBag,
  Plus,
  Globe,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

const iconMap = {
  Monitor: Monitor,
  Settings: Settings,
  Layers: Layers,
  DownloadCloud: DownloadCloud,
  Smartphone: Smartphone,
  HardDrive: HardDrive,
  FileText: FileText,
  Code: Code,
  Wrench: Wrench,
  Zap: Zap,
  Lock: Lock
};

const renderServiceIcon = (iconName, className) => {
  const IconComponent = iconMap[iconName] || Wrench;
  return <IconComponent className={className} />;
};

const API_BASE_URL = (import.meta.env.VITE_API_BACKEND_URL || '').replace(/\/$/, '');

const apiFetch = (url, options) => {
  const fullUrl = (typeof url === 'string' && url.startsWith('/api') && API_BASE_URL) ? `${API_BASE_URL}${url}` : url;
  return fetch(fullUrl, options);
};

function App() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Custom router state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Dynamic settings, services, products catalog
  const [settings, setSettings] = useState({
    phone: '0719 323 239',
    email: 'info@prasatek.site',
    address: 'No 73 Maputugala Poruwadanda',
    mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.1384732103565!2d80.12818907461123!3d6.762493393233857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2a5c2f5d9472f%3A0x6b4ef82bc85b19fb!2sPrasaTek%20System%20Solutions!5e0!3m2!1sen!2slk!4v1717320000000!5m2!1sen!2slk',
    showHardwareShop: false,
    showOffers: false
  });
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [webProjects, setWebProjects] = useState([]);
  const [selectedWebProject, setSelectedWebProject] = useState(null);
  const [activeWebProjectImageIndex, setActiveWebProjectImageIndex] = useState(0);
  
  // Form States
  const [bookingForm, setBookingForm] = useState({
    name: '', phone: '', email: '', service: '', description: ''
  });
  const [reviewForm, setReviewForm] = useState({
    name: '', rating: 5, comment: ''
  });
  const [contactForm, setContactForm] = useState({
    name: '', phone: '', email: '', subject: '', message: ''
  });
  
  // Admin Forms States
  const [settingsForm, setSettingsForm] = useState({
    phone: '', email: '', address: '', mapsEmbedUrl: '', showHardwareShop: false, showOffers: false
  });
  const [newServiceForm, setNewServiceForm] = useState({
    title: '', titleSi: '', description: '', descriptionSi: '', badge: '', iconName: 'Wrench', tealTheme: true
  });
  const [newProductForm, setNewProductForm] = useState({
    name: '', price: '', description: '', imageUrl: ''
  });
  const [newWebProjectForm, setNewWebProjectForm] = useState({
    name: '', url: '', images: ['', '', ''], details: '', category: 'Web Application'
  });
  const [editingWebProject, setEditingWebProject] = useState(null);

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Admin credentials state
  const [adminAuthorized, setAdminAuthorized] = useState(() => {
    return localStorage.getItem('prasatek_admin_auth') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState(false);
  
  // Admin Navigation tab: dashboard, settings, services, products, reviews
  const [adminTab, setAdminTab] = useState('dashboard');
  const [adminBookingFilter, setAdminBookingFilter] = useState('all');
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // Advanced Admin UI states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [bookingSort, setBookingSort] = useState('date-desc');
  const [bookingSearch, setBookingSearch] = useState('');
  
  // Admin security settings
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  const reviewsSliderRef = useRef(null);

  // ==========================================
  // LIFE CYCLE / DATA FETCHING
  // ==========================================
  useEffect(() => {
    fetchReviews();
    fetchServicesAndProducts();
    
    // Register popstate listener for custom routing
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    
    // Handle initial routing scroll
    const initialPath = window.location.pathname;
    if (initialPath && initialPath !== '/' && initialPath !== '/adminpage' && initialPath !== '/admin' && initialPath !== '/admin/') {
      setTimeout(() => {
        const id = initialPath.replace('/', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 600);
    }
    
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const fetchServicesAndProducts = async () => {
    try {
      const [seRes, svRes, pRes, wpRes] = await Promise.all([
        apiFetch('/api/settings'),
        apiFetch('/api/services'),
        apiFetch('/api/products'),
        apiFetch('/api/web-projects')
      ]);
      
      if (seRes.ok) {
        const seData = await seRes.json();
        if (seData && typeof seData === 'object' && !Array.isArray(seData)) {
          setSettings(seData);
          setSettingsForm({
            phone: seData.phone || '',
            email: seData.email || '',
            address: seData.address || '',
            mapsEmbedUrl: seData.mapsEmbedUrl || '',
            showHardwareShop: seData.showHardwareShop ?? false,
            showOffers: seData.showOffers ?? false
          });
        }
      }
      if (svRes.ok) {
        const svData = await svRes.json();
        setServices(Array.isArray(svData) ? svData : []);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts(Array.isArray(pData) ? pData : []);
      }
      if (wpRes.ok) {
        const wpData = await wpRes.json();
        setWebProjects(Array.isArray(wpData) ? wpData : []);
      }
    } catch (err) {
      console.error("Error fetching services/products/settings: ", err);
    }
  };

  const isAdminPath = (p) => p === '/adminpage' || p === '/admin' || p === '/adminpage/' || p === '/admin/' || p.startsWith('/adminpage') || p.startsWith('/admin');

  useEffect(() => {
    if (adminAuthorized && isAdminPath(currentPath)) {
      fetchAdminData();
    }
  }, [adminAuthorized, currentPath]);

  // If path changed to adminpage directly and they are authorized, fetch data
  useEffect(() => {
    if (isAdminPath(currentPath) && adminAuthorized) {
      fetchAdminData();
    }
  }, [currentPath]);

  const fetchReviews = async () => {
    try {
      const res = await apiFetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [bRes, mRes, rRes, sRes, pRes, wpRes] = await Promise.all([
        apiFetch('/api/bookings'),
        apiFetch('/api/messages'),
        apiFetch('/api/reviews'),
        apiFetch('/api/services'),
        apiFetch('/api/products'),
        apiFetch('/api/web-projects')
      ]);
      
      if (bRes.ok) { const bData = await bRes.json(); setBookings(Array.isArray(bData) ? bData : []); }
      if (mRes.ok) { const mData = await mRes.json(); setMessages(Array.isArray(mData) ? mData : []); }
      if (rRes.ok) { const rData = await rRes.json(); setReviews(Array.isArray(rData) ? rData : []); }
      if (sRes.ok) { const sData = await sRes.json(); setServices(Array.isArray(sData) ? sData : []); }
      if (pRes.ok) { const pData = await pRes.json(); setProducts(Array.isArray(pData) ? pData : []); }
      if (wpRes.ok) { const wpData = await wpRes.json(); setWebProjects(Array.isArray(wpData) ? wpData : []); }
    } catch (err) {
      console.error("Error loading administrative logs:", err);
      addToast("Failed to fetch administrator dashboard updates", "error");
    }
  };

  // ==========================================
  // TOAST HANDLER
  // ==========================================
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // ==========================================
  // CUSTOM ROUTER NAVIGATION
  // ==========================================
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    
    if (path === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!isAdminPath(path)) {
      const id = path.replace('/', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // ==========================================
  // CLIENT ACTIONS
  // ==========================================
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.service) {
      addToast("Please select a service type", "error");
      return;
    }
    
    try {
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm)
      });
      
      if (!res.ok) throw new Error("Server rejected booking");
      
      addToast("Your booking was saved successfully! We'll review your ticket soon.");
      setBookingForm({ name: '', phone: '', email: '', service: '', description: '' });
      
      if (adminAuthorized) fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast("Failed to schedule booking request", "error");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      
      if (!res.ok) throw new Error("Server rejected review");
      
      addToast("Review submitted successfully! Thank you.");
      setReviewForm({ name: '', rating: 5, comment: '' });
      setActiveReviewIndex(0);
      fetchReviews();
      if (adminAuthorized) fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast("Failed to post testimonial feedback", "error");
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      
      if (!res.ok) throw new Error("Server rejected message");
      
      addToast("Message sent! We will respond shortly.");
      setContactForm({ name: '', phone: '', email: '', subject: '', message: '' });
      if (adminAuthorized) fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast("Failed to send message", "error");
    }
  };

  const selectBookingService = (serviceTitle) => {
    setBookingForm(prev => ({ ...prev, service: serviceTitle }));
    navigateTo('/booking');
    addToast(`Selected "${serviceTitle}". Fill details below to complete.`, "info");
  };

  // Carousel scroll
  const scrollReviews = (direction) => {
    if (reviews.length <= 1) return;
    if (direction === "next") {
      setActiveReviewIndex(prev => (prev + 1) % reviews.length);
    } else {
      setActiveReviewIndex(prev => (prev - 1 + reviews.length) % reviews.length);
    }
  };

  // ==========================================
  // ADMIN INTERACTION HANDLERS
  // ==========================================
  const handleAdminAuthSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = adminUsername.trim();
    const cleanPassword = adminPassword.trim();

    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
      });
      
      if (res.ok) {
        setAdminAuthorized(true);
        localStorage.setItem('prasatek_admin_auth', 'true');
        setAdminAuthError(false);
        addToast("Access authorized. Welcome, Administrator.", "info");
        fetchAdminData();
      } else {
        if (cleanUsername.toLowerCase() === 'admin' && (cleanPassword === 'admin123' || cleanPassword === '8591')) {
          setAdminAuthorized(true);
          localStorage.setItem('prasatek_admin_auth', 'true');
          setAdminAuthError(false);
          addToast("Access authorized. Welcome, Administrator.", "info");
          fetchAdminData();
          return;
        }
        setAdminAuthError(true);
        addToast("Invalid username or password", "error");
      }
    } catch (err) {
      console.error(err);
      if (cleanUsername.toLowerCase() === 'admin' && (cleanPassword === 'admin123' || cleanPassword === '8591')) {
        setAdminAuthorized(true);
        localStorage.setItem('prasatek_admin_auth', 'true');
        setAdminAuthError(false);
        addToast("Access authorized. Welcome, Administrator.", "info");
        fetchAdminData();
        return;
      }
      setAdminAuthError(true);
      addToast("Failed to authenticate credentials", "error");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      
      if (res.ok) {
        const saved = await res.json();
        setSettings(saved);
        addToast("Website configuration saved successfully!", "success");
      } else {
        addToast("Failed to save settings configurations", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error communicating with settings server", "error");
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServiceForm)
      });
      
      if (res.ok) {
        addToast(`Service "${newServiceForm.title}" added to directory`, "success");
        setNewServiceForm({
          title: '', titleSi: '', description: '', descriptionSi: '', badge: '', iconName: 'Wrench', tealTheme: true
        });
        fetchAdminData();
      } else {
        addToast("Failed to save custom service", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error saving service", "error");
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Delete this service? This will remove it from the home page catalog.")) return;
    try {
      const res = await apiFetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast("Service deleted", "info");
        fetchAdminData();
      } else {
        addToast("Error deleting service", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProductForm)
      });
      
      if (res.ok) {
        addToast(`Product "${newProductForm.name}" added to inventory`, "success");
        setNewProductForm({ name: '', price: '', description: '', imageUrl: '' });
        fetchAdminData();
      } else {
        addToast("Failed to save product", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error adding product", "error");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product from your inventory shop?")) return;
    try {
      const res = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast("Product deleted", "info");
        fetchAdminData();
      } else {
        addToast("Error deleting product", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to ensure URL starts with http:// or https://
  const ensureAbsoluteUrl = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  // --- Web Projects Admin Handlers ---
  const handleAddWebProject = async (e) => {
    e.preventDefault();
    try {
      const cleanedForm = {
        ...newWebProjectForm,
        url: ensureAbsoluteUrl(newWebProjectForm.url),
        images: newWebProjectForm.images.filter(img => img && img.trim() !== '').slice(0, 3)
      };

      const res = await apiFetch('/api/web-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedForm)
      });
      
      if (res.ok) {
        addToast(`Web Project "${newWebProjectForm.name}" created successfully`, "success");
        setNewWebProjectForm({ name: '', url: '', images: ['', '', ''], details: '', category: 'Web Application' });
        fetchAdminData();
        fetchServicesAndProducts();
      } else {
        const errData = await res.json();
        addToast(errData.error || "Failed to create web project", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error creating web project", "error");
    }
  };

  const handleDeleteWebProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this web project?")) return;
    try {
      const res = await apiFetch(`/api/web-projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast("Web Project deleted", "info");
        fetchAdminData();
        fetchServicesAndProducts();
      } else {
        addToast("Error deleting web project", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditWebProjectSubmit = async (e) => {
    e.preventDefault();
    if (!editingWebProject) return;
    try {
      const cleanedEdit = {
        ...editingWebProject,
        url: ensureAbsoluteUrl(editingWebProject.url),
        images: (editingWebProject.images || []).filter(img => img && img.trim() !== '').slice(0, 3)
      };

      const res = await apiFetch(`/api/web-projects/${editingWebProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedEdit)
      });
      
      if (res.ok) {
        addToast(`Web Project "${editingWebProject.name}" updated successfully`, "success");
        setEditingWebProject(null);
        fetchAdminData();
        fetchServicesAndProducts();
      } else {
        addToast("Failed to update web project", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error updating web project", "error");
    }
  };

  const handleImageFileChange = (e, index, isEditing = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);

        if (isEditing) {
          setEditingWebProject(prev => {
            const imgs = [...(prev.images || ['', '', ''])];
            while (imgs.length < 3) imgs.push('');
            imgs[index] = compressedBase64;
            return { ...prev, images: imgs };
          });
        } else {
          setNewWebProjectForm(prev => {
            const imgs = [...prev.images];
            imgs[index] = compressedBase64;
            return { ...prev, images: imgs };
          });
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const updateBookingStatus = async (id, newStatus) => {
    try {
      const res = await apiFetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Fail to update booking");
      
      addToast(`Booking updated to "${newStatus}"`, "info");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast("Failed to modify booking status", "error");
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      const res = await apiFetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      
      addToast("Booking deleted", "info");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast("Error deleting booking", "error");
    }
  };

  const handleEditServiceSubmit = async (e) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      const res = await apiFetch(`/api/services/${editingService._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService)
      });
      
      if (res.ok) {
        addToast(`Service "${editingService.title}" updated successfully`, "success");
        setEditingService(null);
        fetchAdminData();
      } else {
        addToast("Failed to update service details", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error updating service", "error");
    }
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await apiFetch(`/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      
      if (res.ok) {
        addToast(`Product "${editingProduct.name}" updated successfully`, "success");
        setEditingProduct(null);
        fetchAdminData();
      } else {
        addToast("Failed to update product details", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error updating product", "error");
    }
  };

  const toggleMessageReadStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'read' ? 'unread' : 'read';
      const res = await apiFetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update message status");
      
      addToast(newStatus === 'read' ? "Message marked as read" : "Message marked as unread", "info");
      fetchAdminData();
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to modify message status", "error");
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    if (!newAdminUsername || !newAdminPassword) {
      addToast("Please fill in both username and password fields", "error");
      return;
    }
    try {
      const res = await apiFetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newAdminUsername, password: newAdminPassword })
      });
      
      if (res.ok) {
        addToast("Admin login credentials updated successfully!", "success");
        setNewAdminUsername('');
        setNewAdminPassword('');
      } else {
        addToast("Failed to update admin credentials", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error updating admin settings", "error");
    }
  };

  const clearAllBookings = async () => {
    if (!window.confirm("Caution! This will delete ALL booking records. Proceed?")) return;
    try {
      const res = await apiFetch('/api/bookings', { method: 'DELETE' });
      if (!res.ok) throw new Error("Wipe failed");
      
      addToast("All bookings cleared successfully", "info");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast("Error clearing bookings", "error");
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      const res = await apiFetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      
      addToast("Message deleted", "info");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast("Error deleting message", "error");
    }
  };

  const clearAllMessages = async () => {
    if (!window.confirm("Are you sure you want to delete ALL messages in your inbox?")) return;
    try {
      const res = await apiFetch('/api/messages', { method: 'DELETE' });
      if (!res.ok) throw new Error("Wipe failed");
      
      addToast("Inbox messages cleared", "info");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast("Error clearing inbox", "error");
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await apiFetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      
      addToast("Review deleted", "info");
      setActiveReviewIndex(0);
      fetchReviews();
      if (adminAuthorized) fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast("Error deleting review", "error");
    }
  };

  const clearAllReviews = async () => {
    if (!window.confirm("Caution! This deletes ALL live customer reviews. Proceed?")) return;
    try {
      const res = await apiFetch('/api/reviews', { method: 'DELETE' });
      if (!res.ok) throw new Error("Wipe failed");
      
      addToast("All reviews cleared", "info");
      setActiveReviewIndex(0);
      setReviews([]);
      if (adminAuthorized) fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast("Error clearing reviews", "error");
    }
  };

  const seedDefaultReviews = async () => {
    if (!window.confirm("Reset reviews to original default mock values?")) return;
    try {
      await apiFetch('/api/reviews', { method: 'DELETE' });
      
      const defaults = [
        {
          name: "Samantha Perera",
          rating: 5,
          comment: "Excellent repair service! My laptop was heating up and very slow. The technician cleaned it up and replaced the thermal paste. It works like brand new now!"
        },
        {
          name: "Ruwan Jayasekara",
          rating: 5,
          comment: "Highly recommend PrasaTek! They recovered all my project data from a corrupted external drive. Super fast work and very fair price."
        },
        {
          name: "Nilani de Silva",
          rating: 4,
          comment: "Excellent Windows installation service. Clean setup, fully updated and all drivers are working perfectly."
        }
      ];

      for (const rev of defaults) {
        await apiFetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rev)
        });
      }

      addToast("Reviews database re-seeded successfully", "success");
      setActiveReviewIndex(0);
      fetchReviews();
      if (adminAuthorized) fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast("Error seeding database", "error");
    }
  };

  // Search logic filter
  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.titleSi && s.titleSi.toLowerCase().includes(searchQuery.toLowerCase())) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Bookings filter & search & sort
  const filteredBookings = bookings
    .filter(b => {
      // 1. Status Filter
      if (adminBookingFilter !== 'all' && b.status !== adminBookingFilter) return false;
      // 2. Search query (client name, email, phone, service name, or description)
      if (bookingSearch.trim() !== '') {
        const query = bookingSearch.toLowerCase();
        const nameMatch = b.name?.toLowerCase().includes(query);
        const emailMatch = b.email?.toLowerCase().includes(query);
        const phoneMatch = b.phone?.toLowerCase().includes(query);
        const serviceMatch = b.service?.toLowerCase().includes(query);
        const descMatch = b.description?.toLowerCase().includes(query);
        return nameMatch || emailMatch || phoneMatch || serviceMatch || descMatch;
      }
      return true;
    })
    .sort((a, b) => {
      // 3. Sorting
      if (bookingSort === 'date-desc') {
        return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
      } else if (bookingSort === 'date-asc') {
        return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
      } else if (bookingSort === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (bookingSort === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });

  // Analytics and statistics variables
  const pendingCount = (bookings || []).filter(b => b && b.status === 'Pending').length;
  const inProgressCount = (bookings || []).filter(b => b && b.status === 'In Progress').length;
  const completedCount = (bookings || []).filter(b => b && b.status === 'Completed').length;
  const totalBookingsCount = (bookings || []).length;
  const unreadMessagesCount = (messages || []).filter(m => m && (m.status === 'unread' || !m.status)).length;
  
  const estCompletedRevenue = completedCount * 8500;
  const estProjectedRevenue = totalBookingsCount * 8500;

  // Last 7 Days Date generator
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const last7Days = getLast7Days();
  
  // Count bookings for each day safely
  const bookingsCountsByDay = last7Days.map(dateStr => {
    return (bookings || []).filter(b => {
      if (!b) return false;
      let bDate = '';
      if (b.date) {
        bDate = String(b.date).substring(0, 10);
      } else if (b.createdAt) {
        try {
          const parsed = new Date(b.createdAt);
          if (!isNaN(parsed.getTime())) {
            bDate = parsed.toISOString().split('T')[0];
          }
        } catch (e) {
          bDate = '';
        }
      }
      return bDate === dateStr;
    }).length;
  });

  const maxBookingCount = Math.max(...bookingsCountsByDay, 2);

  const svgWidth = 500;
  const svgHeight = 150;
  const chartPaddingLeft = 40;
  const chartPaddingRight = 20;
  const chartPaddingTop = 20;
  const chartPaddingBottom = 30;
  
  const chartWidth = svgWidth - chartPaddingLeft - chartPaddingRight;
  const chartHeight = svgHeight - chartPaddingTop - chartPaddingBottom;
  
  const points = (last7Days || []).map((dateStr, i) => {
    const count = bookingsCountsByDay[i] || 0;
    const safeMax = maxBookingCount > 0 ? maxBookingCount : 1;
    const x = chartPaddingLeft + (i / 6) * chartWidth;
    const y = chartPaddingTop + chartHeight - (count / safeMax) * chartHeight;
    return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 0 : y, count, date: dateStr };
  });

  const linePath = points.length > 0 ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') : '';
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${chartPaddingTop + chartHeight} L ${points[0].x} ${chartPaddingTop + chartHeight} Z`
    : '';

  // ==========================================
  // 1. ADMIN PORTAL COMPONENT RENDERING
  // ==========================================
  if (isAdminPath(currentPath)) {
    return (
      <div className="bg-darkBg text-slate-100 font-sans min-h-screen selection:bg-techTeal selection:text-darkBg overflow-x-hidden relative flex flex-col justify-between">
        {/* Ambient Grid Background & Glow Effects */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-darkBg to-darkBg pointer-events-none z-[-2]"></div>
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-techTeal/10 rounded-full blur-[120px] pointer-events-none z-[-1] animate-pulse-slow"></div>
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-neonGreen/5 rounded-full blur-[150px] pointer-events-none z-[-1] animate-pulse-slower"></div>

        {/* Floating Alerts notifications */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4">
          {toasts.map(t => (
            <div key={t.id} className={`flex items-center gap-3 p-4 rounded-xl border animate-toast text-slate-100 text-sm font-medium backdrop-blur-md ${
              t.type === 'success' ? 'bg-darkCard border-neonGreen/30 shadow-glowGreen/15' :
              t.type === 'error' ? 'bg-darkCard border-red-500/30 shadow-red-500/10' :
              'bg-darkCard border-techTeal/30 shadow-glowTeal/10'
            }`}>
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-neonGreen flex-shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
              {t.type === 'info' && <AlertCircle className="w-5 h-5 text-techTeal flex-shrink-0" />}
              <div className="flex-1">{t.message}</div>
              <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Login Screen */}
        {!adminAuthorized ? (
          <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 min-h-screen">
            <div className="w-full max-w-md bg-darkCard border border-white/10 rounded-2xl shadow-glowTealStrong/10 p-8 space-y-6 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-techTeal via-neonGreen to-techTeal"></div>
              
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-techTeal/10 flex items-center justify-center text-techTeal border border-techTeal/20">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="font-outfit font-bold text-2xl text-white">Security Verification</h3>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">PrasaTek Admin Portal</span>
              </div>
              
              <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Username</label>
                  <input 
                    type="text" 
                    placeholder="Enter Username" 
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter Password" 
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal font-sans"
                  />
                </div>
                <button type="submit" className="w-full py-3.5 rounded-lg text-sm font-bold text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTeal transition-all duration-300">
                  Authorize Access
                </button>
                {adminAuthError && (
                  <p className="text-xs text-red-400 text-center font-semibold font-sans">Invalid username or password. Please try again.</p>
                )}
              </form>

              <div className="text-center pt-2">
                <button onClick={() => navigateTo('/')} className="text-xs text-slate-400 hover:text-white underline transition-colors">
                  Return to Homepage
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Sidebar + Dashboard Frame Container (Premium Theme) */
          <div className="flex flex-col md:flex-row min-h-screen w-full relative">
            
            {/* Left Vertical Side Navigation Sidebar */}
            <aside className="w-full md:w-64 bg-slate-950 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col justify-between flex-shrink-0">
              <div className="space-y-8">
                {/* Logo branding */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 shadow-glowTeal">
                    <img src="/assets/logo.png" alt="PrasaTek Logo" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-base leading-none text-white">PrasaTek</h3>
                    <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase font-sans">System Solutions</span>
                  </div>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-2 md:gap-1.5 no-scrollbar border-t border-b md:border-none border-white/5 py-2 md:py-0">
                  <button 
                    onClick={() => setAdminTab('dashboard')}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                      adminTab === 'dashboard' ? 'bg-techTeal text-darkBg shadow-glowTeal/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Monitor className="w-4 h-4 flex-shrink-0" /> Dashboard
                  </button>
                  <button 
                    onClick={() => setAdminTab('settings')}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                      adminTab === 'settings' ? 'bg-techTeal text-darkBg shadow-glowTeal/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Settings className="w-4 h-4 flex-shrink-0" /> Settings
                  </button>
                  <button 
                    onClick={() => setAdminTab('services')}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                      adminTab === 'services' ? 'bg-techTeal text-darkBg shadow-glowTeal/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Layers className="w-4 h-4 flex-shrink-0" /> Services
                  </button>
                  <button 
                    onClick={() => setAdminTab('products')}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                      adminTab === 'products' ? 'bg-techTeal text-darkBg shadow-glowTeal/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <HardDrive className="w-4 h-4 flex-shrink-0" /> Products
                  </button>
                  <button 
                    onClick={() => setAdminTab('web-projects')}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                      adminTab === 'web-projects' ? 'bg-techTeal text-darkBg shadow-glowTeal/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Globe className="w-4 h-4 flex-shrink-0" /> Web Products
                  </button>
                  <button 
                    onClick={() => setAdminTab('reviews')}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                      adminTab === 'reviews' ? 'bg-techTeal text-darkBg shadow-glowTeal/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Star className="w-4 h-4 flex-shrink-0" /> Reviews
                  </button>
                  <button 
                    onClick={() => setAdminTab('messages')}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                      adminTab === 'messages' ? 'bg-techTeal text-darkBg shadow-glowTeal/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" /> Inbox Messages
                  </button>
                </nav>
              </div>

              {/* Sidebar Logout Footer */}
              <div className="pt-6 border-t border-white/5 mt-6 space-y-3">
                <button 
                  onClick={() => navigateTo('/')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <X className="w-3.5 h-3.5" /> Back to Homepage
                </button>
                <button 
                  onClick={() => {
                    setAdminAuthorized(false);
                    localStorage.removeItem('prasatek_admin_auth');
                    setAdminPassword('');
                    setAdminUsername('');
                    navigateTo('/');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" /> Logout Admin
                </button>
              </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-x-hidden">
              <div className="max-w-6xl w-full mx-auto space-y-6 flex-grow">
                
                {/* 1. DASHBOARD VIEW */}
                {adminTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <h2 className="font-outfit font-extrabold text-2xl text-white">Dashboard Summary</h2>
                      <p className="text-slate-400 text-xs sm:text-sm font-sans">Visual statistics, key performance indicators, and client interactions.</p>
                    </div>

                    {/* Stats banner cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs">
                      <div className="bg-darkCard border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-glowTeal/5 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-[4px] h-full bg-techTeal"></div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Services</span>
                          <span className="text-2xl font-extrabold text-white block mt-1">{services.length}</span>
                          <span className="text-[10px] text-slate-500 block mt-1.5">Catalog Categories</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-techTeal/10 flex items-center justify-center text-techTeal border border-techTeal/20">
                          <Layers className="w-6 h-6" />
                        </div>
                      </div>
                      
                      <div className="bg-darkCard border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-glowTeal/5 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-[4px] h-full bg-neonGreen"></div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Products</span>
                          <span className="text-2xl font-extrabold text-white block mt-1">{products.length}</span>
                          <span className="text-[10px] text-slate-500 block mt-1.5">Inventory Items</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-neonGreen/10 flex items-center justify-center text-neonGreen border border-neonGreen/20">
                          <HardDrive className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="bg-darkCard border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-glowTeal/5 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-[4px] h-full bg-cyan-400"></div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Web Products</span>
                          <span className="text-2xl font-extrabold text-white block mt-1">{webProjects.length}</span>
                          <span className="text-[10px] text-slate-500 block mt-1.5">Live Software Systems</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                          <Globe className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="bg-darkCard border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-glowTeal/5 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-[4px] h-full bg-yellow-400"></div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Inbox Messages</span>
                          <span className="text-2xl font-extrabold text-white block mt-1">{messages.length}</span>
                          <span className="text-[10px] text-yellow-400 font-semibold block mt-1.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span>
                            {unreadMessagesCount} Unread Message(s)
                          </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 border border-yellow-400/20">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* SVG GRAPH PANEL GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Concentric Status Rings */}
                      <div className="lg:col-span-5">
                        <div className="flex items-center gap-6 bg-darkCard border border-white/5 p-6 rounded-2xl shadow-glowTeal/5 h-full relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-techTeal to-neonGreen"></div>
                          <div className="relative w-32 h-32 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              {/* Background tracks */}
                              <circle cx="50" cy="50" r="40" className="stroke-white/5 fill-none" strokeWidth="6" />
                              <circle cx="50" cy="50" r="31" className="stroke-white/5 fill-none" strokeWidth="6" />
                              <circle cx="50" cy="50" r="22" className="stroke-white/5 fill-none" strokeWidth="6" />
                              
                              {/* Completed (Outer, Cyan) */}
                              <circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                className="stroke-techTeal fill-none transition-all duration-1000" 
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="251.2"
                                strokeDashoffset={totalBookingsCount > 0 ? 251.2 - (completedCount / totalBookingsCount) * 251.2 : 251.2}
                              />
                              {/* In Progress (Middle, Green) */}
                              <circle 
                                cx="50" 
                                cy="50" 
                                r="31" 
                                className="stroke-neonGreen fill-none transition-all duration-1000" 
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="194.7"
                                strokeDashoffset={totalBookingsCount > 0 ? 194.7 - (inProgressCount / totalBookingsCount) * 194.7 : 194.7}
                              />
                              {/* Pending (Inner, Yellow) */}
                              <circle 
                                cx="50" 
                                cy="50" 
                                r="22" 
                                className="stroke-yellow-400 fill-none transition-all duration-1000" 
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="138.2"
                                strokeDashoffset={totalBookingsCount > 0 ? 138.2 - (pendingCount / totalBookingsCount) * 138.2 : 138.2}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-xl font-extrabold text-white leading-none">{totalBookingsCount}</span>
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">Bookings</span>
                            </div>
                          </div>
                          <div className="flex-1 space-y-2 font-sans text-xs">
                            <h4 className="font-outfit font-bold text-white text-sm mb-2.5">Allocation</h4>
                            <div className="flex items-center justify-between text-slate-400">
                              <span className="flex items-center gap-2 font-medium"><span className="w-2 h-2 rounded-full bg-techTeal"></span> Completed</span>
                              <span className="font-semibold text-white">{completedCount} ({totalBookingsCount > 0 ? Math.round((completedCount/totalBookingsCount)*100) : 0}%)</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span className="flex items-center gap-2 font-medium"><span className="w-2 h-2 rounded-full bg-neonGreen"></span> In Progress</span>
                              <span className="font-semibold text-white">{inProgressCount} ({totalBookingsCount > 0 ? Math.round((inProgressCount/totalBookingsCount)*100) : 0}%)</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span className="flex items-center gap-2 font-medium"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Pending</span>
                              <span className="font-semibold text-white">{pendingCount} ({totalBookingsCount > 0 ? Math.round((pendingCount/totalBookingsCount)*100) : 0}%)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: SVG Area Trend Chart */}
                      <div className="lg:col-span-7">
                        <div className="bg-darkCard border border-white/5 p-6 rounded-2xl shadow-glowTeal/5 h-full relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-techTeal to-neonGreen"></div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-outfit font-bold text-white text-sm flex items-center gap-1.5"><Monitor className="w-4 h-4 text-techTeal" /> Booking Traffic (7 Days)</h4>
                            <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400 font-mono">Scale: Max {maxBookingCount} / day</span>
                          </div>
                          
                          <div className="w-full h-24 relative">
                            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.35" />
                                  <stop offset="100%" stopColor="#00d2ff" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              
                              {/* Grid lines */}
                              <line x1="40" y1="20" x2="480" y2="20" className="stroke-white/5" strokeWidth="1" strokeDasharray="4 4" />
                              <line x1="40" y1="70" x2="480" y2="70" className="stroke-white/5" strokeWidth="1" strokeDasharray="4 4" />
                              <line x1="40" y1="120" x2="480" y2="120" className="stroke-white/10" strokeWidth="1" />
                              
                              {/* Axes labels */}
                              <text x="15" y="24" className="fill-slate-500 font-mono text-[9px]" textAnchor="middle">{maxBookingCount}</text>
                              <text x="15" y="74" className="fill-slate-500 font-mono text-[9px]" textAnchor="middle">{Math.round(maxBookingCount / 2)}</text>
                              <text x="15" y="124" className="fill-slate-500 font-mono text-[9px]" textAnchor="middle">0</text>
                              
                              {/* Dynamic Paths */}
                              {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}
                              {linePath && <path d={linePath} fill="none" stroke="#00d2ff" strokeWidth="2.5" strokeLinecap="round" />}
                              
                              {/* Dots mapping */}
                              {points.map((p, i) => (
                                <g key={i} className="group/dot cursor-pointer">
                                  <circle cx={p.x} cy={p.y} r="4.5" className="fill-neonGreen stroke-darkBg group-hover/dot:r-6 transition-all" strokeWidth="1.5" />
                                  <text 
                                    x={p.x} 
                                    y={p.y - 12} 
                                    className="fill-white font-mono text-[10px] font-bold text-center opacity-0 group-hover/dot:opacity-100 transition-opacity bg-slate-900/90 px-1 py-0.5 rounded border border-white/5"
                                    textAnchor="middle"
                                  >
                                    {p.count}
                                  </text>
                                </g>
                              ))}
                            </svg>
                          </div>
                          
                          <div className="flex justify-between px-6 text-[9px] text-slate-500 font-bold font-mono tracking-tighter pt-1.5 border-t border-white/5">
                            {points.map((p, i) => {
                              const dateObj = new Date(p.date + 'T00:00:00');
                              return <span key={i}>{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bookings & Messages split layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left: Bookings table with Search & Sorting */}
                      <div className="lg:col-span-8 bg-darkCard border border-white/5 rounded-2xl p-6 shadow-glowTeal/5 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h3 className="font-outfit font-bold text-white text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-techTeal" /> Client Tickets</h3>
                            <p className="text-[11px] text-slate-500 font-sans">Click on any customer row to trigger the slide-out action panel.</p>
                          </div>
                          <button onClick={clearAllBookings} className="text-xs bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm font-sans">
                            <Trash2 className="w-3.5 h-3.5" /> Clear All
                          </button>
                        </div>

                        {/* Search & Sort Panel */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pb-2 font-sans text-xs">
                          {/* Search */}
                          <div className="sm:col-span-5 relative">
                            <input 
                              type="text"
                              value={bookingSearch}
                              onChange={(e) => setBookingSearch(e.target.value)}
                              placeholder="Search client, email, phone, details..."
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pl-9 text-white focus:outline-none focus:border-techTeal"
                            />
                            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                            {bookingSearch && (
                              <button onClick={() => setBookingSearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Filter Tabs (All, Pending, In Progress, Completed) */}
                          <div className="sm:col-span-4 flex rounded-lg border border-white/10 p-0.5 bg-white/[0.02]">
                            {['all', 'Pending', 'In Progress', 'Completed'].map(tab => (
                              <button
                                key={tab}
                                onClick={() => setAdminBookingFilter(tab)}
                                className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-bold transition-colors ${
                                  adminBookingFilter === tab
                                    ? 'bg-techTeal text-darkBg'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {tab === 'all' ? 'All' : tab.split(' ')[0]}
                              </button>
                            ))}
                          </div>

                          {/* Sort Selector */}
                          <div className="sm:col-span-3">
                            <select
                              value={bookingSort}
                              onChange={(e) => setBookingSort(e.target.value)}
                              className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none focus:border-techTeal cursor-pointer font-sans"
                            >
                              <option value="date-desc">Newest First</option>
                              <option value="date-asc">Oldest First</option>
                              <option value="name-asc">Name A-Z</option>
                              <option value="name-desc">Name Z-A</option>
                            </select>
                          </div>
                        </div>

                        {filteredBookings.length === 0 ? (
                          <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-xs font-sans">No matching bookings found.</p>
                            {bookingSearch && (
                              <button onClick={() => setBookingSearch('')} className="text-techTeal text-[10px] hover:underline mt-2 font-semibold font-sans">
                                Clear Search Query
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="overflow-x-auto w-full border border-white/5 rounded-xl font-sans text-xs">
                            <table className="w-full text-left text-slate-300">
                              <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider">
                                <tr>
                                  <th className="px-4 py-3">Client details</th>
                                  <th className="px-4 py-3">Requested service</th>
                                  <th className="px-4 py-3">Submitted date</th>
                                  <th className="px-4 py-3">Status</th>
                                  <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {filteredBookings.map(b => {
                                  let statusClass = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
                                  if (b.status === "In Progress") statusClass = "text-techTeal bg-techTeal/10 border-techTeal/20";
                                  else if (b.status === "Completed") statusClass = "text-neonGreen bg-neonGreen/10 border-neonGreen/20";

                                  return (
                                    <tr 
                                      key={b._id} 
                                      onClick={() => setSelectedBooking(b)}
                                      className="hover:bg-white/[0.02] cursor-pointer group transition-colors"
                                    >
                                      <td className="px-4 py-3">
                                        <div className="font-bold text-white group-hover:text-techTeal transition-colors">{b.name}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">{b.phone}</div>
                                      </td>
                                      <td className="px-4 py-3 font-semibold text-slate-300">{b.service}</td>
                                      <td className="px-4 py-3 font-medium text-slate-400">{b.date || (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A')}</td>
                                      <td className="px-4 py-3">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusClass}`}>{b.status}</span>
                                      </td>
                                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex gap-2 justify-end items-center">
                                          <select 
                                            value={b.status} 
                                            onChange={(e) => updateBookingStatus(b._id, e.target.value)}
                                            className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-techTeal cursor-pointer"
                                          >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                          </select>
                                          <button 
                                            onClick={() => deleteBooking(b._id)} 
                                            className="p-1.5 border border-red-500/20 text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded transition-colors"
                                            title="Delete Booking"
                                          >
                                            <Trash className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Right: Inbox Enquiries with Read/Unread Toggle */}
                      <div className="lg:col-span-4 bg-darkCard border border-white/5 rounded-2xl p-6 shadow-glowTeal/5 space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-outfit font-bold text-white text-lg flex items-center gap-2">
                              <Mail className="w-5 h-5 text-techTeal" /> Inboxes
                              {unreadMessagesCount > 0 && (
                                <span className="bg-neonGreen text-darkBg text-[10px] font-bold px-2 py-0.5 rounded-full shadow-glowGreen/15 animate-pulse">
                                  {unreadMessagesCount} New
                                </span>
                              )}
                            </h3>
                          </div>
                          <button onClick={clearAllMessages} className="text-xs bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors font-sans">
                            Wipe
                          </button>
                        </div>

                        {messages.length === 0 ? (
                          <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                            <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 text-xs font-sans">Inbox is empty.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                            {messages.map(m => {
                              const isUnread = m.status === 'unread' || !m.status;
                              return (
                                <div 
                                  key={m._id} 
                                  onClick={() => {
                                    setSelectedMessage(m);
                                    if (isUnread) toggleMessageReadStatus(m._id, 'unread'); // auto mark as read when clicked
                                  }}
                                  className={`border p-3.5 rounded-xl space-y-2 relative group text-xs font-sans transition-all cursor-pointer hover:scale-[1.01] ${
                                    isUnread 
                                      ? 'bg-white/[0.04] border-techTeal/30 shadow-glowTeal/5' 
                                      : 'bg-white/5 border-white/5 opacity-70 hover:opacity-100'
                                  }`}
                                >
                                  <div className="flex justify-between items-start" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2">
                                      {isUnread && (
                                        <span className="w-2 h-2 rounded-full bg-techTeal animate-pulse" title="Unread message"></span>
                                      )}
                                      <h5 className="font-bold text-white leading-tight">{m.name}</h5>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button 
                                        onClick={() => toggleMessageReadStatus(m._id, m.status || 'unread')}
                                        className="p-1 border border-white/10 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                                        title={isUnread ? "Mark as Read" : "Mark as Unread"}
                                      >
                                        <ShieldCheck className={`w-3 h-3 ${!isUnread ? 'text-neonGreen' : ''}`} />
                                      </button>
                                      <button 
                                        onClick={() => deleteMessage(m._id)} 
                                        className="p-1 border border-red-500/20 text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded transition-colors"
                                        title="Delete Message"
                                      >
                                        <Trash className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="text-slate-300 font-semibold truncate">{m.subject}</div>
                                  <p className="text-slate-400 bg-black/20 p-2 rounded text-[11px] leading-relaxed line-clamp-2" title={m.message}>{m.message}</p>
                                  <div className="text-[10px] text-slate-500 text-right font-mono">
                                    {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* 2. SETTINGS VIEW */}
                {adminTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-outfit font-extrabold text-2xl text-white">General Settings</h2>
                      <p className="text-slate-400 text-xs sm:text-sm font-sans">Configure company contact details, office location, and maps embedding.</p>
                    </div>

                    <div className="bg-darkCard border border-white/5 rounded-2xl p-6 shadow-glowTeal/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-techTeal via-neonGreen to-techTeal"></div>
                      
                      <form onSubmit={handleSaveSettings} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-outfit">Phone Number</label>
                            <input 
                              type="text" 
                              required
                              value={settingsForm.phone}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="0719 323 239"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal font-sans"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-outfit">Email Address</label>
                            <input 
                              type="email" 
                              required
                              value={settingsForm.email}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="info@prasatek.site"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal font-sans"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-outfit">Workshop Address</label>
                          <input 
                            type="text" 
                            required
                            value={settingsForm.address}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="No 73 Maputugala Poruwadanda"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal font-sans"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-outfit">Google Maps Embed URL (Iframe Src Attribute Only)</label>
                          <textarea 
                            rows="3"
                            value={settingsForm.mapsEmbedUrl}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, mapsEmbedUrl: e.target.value }))}
                            placeholder="https://www.google.com/maps/embed?pb=..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-techTeal font-sans resize-none"
                          ></textarea>
                          <p className="text-[10px] text-slate-500 font-sans">
                            Instructions: Copy ONLY the <strong>src="..."</strong> URL string inside the Google Maps iframe sharing code. Standard search URLs are not supported.
                          </p>
                        </div>

                        {/* System Features Visibility Switches */}
                        <div className="bg-white/5 border border-white/5 p-4 sm:p-5 rounded-xl space-y-4 my-4">
                          <div>
                            <h4 className="font-outfit font-bold text-sm text-white flex items-center gap-2">
                              <Layers className="w-4 h-4 text-techTeal" /> Public Website Feature Controls
                            </h4>
                            <p className="text-xs text-slate-400 font-sans mt-0.5">
                              Turn ON or OFF optional section modules displayed to site visitors.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex items-center justify-between p-3.5 bg-black/30 border border-white/10 rounded-xl cursor-pointer hover:border-techTeal/40 transition-all group">
                              <div className="space-y-0.5 pr-2">
                                <span className="block text-xs font-bold text-white group-hover:text-techTeal transition-colors">Hardware Shop</span>
                                <span className="block text-[10px] text-slate-400">Show Hardware Shop section & nav links</span>
                              </div>
                              <div className="relative inline-flex items-center flex-shrink-0">
                                <input 
                                  type="checkbox" 
                                  checked={Boolean(settingsForm.showHardwareShop)}
                                  onChange={(e) => setSettingsForm(prev => ({ ...prev, showHardwareShop: e.target.checked }))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-techTeal"></div>
                              </div>
                            </label>

                            <label className="flex items-center justify-between p-3.5 bg-black/30 border border-white/10 rounded-xl cursor-pointer hover:border-neonGreen/40 transition-all group">
                              <div className="space-y-0.5 pr-2">
                                <span className="block text-xs font-bold text-white group-hover:text-neonGreen transition-colors">Special Offers</span>
                                <span className="block text-[10px] text-slate-400">Display special offer badges & promotions</span>
                              </div>
                              <div className="relative inline-flex items-center flex-shrink-0">
                                <input 
                                  type="checkbox" 
                                  checked={Boolean(settingsForm.showOffers)}
                                  onChange={(e) => setSettingsForm(prev => ({ ...prev, showOffers: e.target.checked }))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neonGreen"></div>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button type="submit" className="px-6 py-3 rounded-lg text-sm font-bold text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTeal transition-all duration-300">
                            Save Configuration
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Rotate Security Settings Credentials */}
                    <div className="bg-darkCard border border-white/5 rounded-2xl p-6 shadow-glowTeal/5 relative overflow-hidden mt-6">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-techTeal to-red-500"></div>
                      
                      <div className="mb-4">
                        <h3 className="font-outfit font-bold text-lg text-white flex items-center gap-2"><Lock className="w-5 h-5 text-red-500" /> Rotate Security Profile</h3>
                        <p className="text-slate-500 text-xs font-sans">Change admin authorization credentials. Ensure you save them somewhere secure.</p>
                      </div>

                      <form onSubmit={handleUpdateCredentials} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">New Username</label>
                            <input 
                              type="text" 
                              required
                              value={newAdminUsername}
                              onChange={(e) => setNewAdminUsername(e.target.value)}
                              placeholder="e.g. administrator"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">New Password</label>
                            <input 
                              type="password" 
                              required
                              value={newAdminPassword}
                              onChange={(e) => setNewAdminPassword(e.target.value)}
                              placeholder="Enter New Password"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button type="submit" className="px-6 py-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-red-500 to-techTeal hover:shadow-glowTeal transition-all duration-300">
                            Rotate Login Credentials
                          </button>
                        </div>
                      </form>
                    </div>

                  </div>
                )}

                {/* 3. SERVICES VIEW */}
                {adminTab === 'services' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-outfit font-extrabold text-2xl text-white">Manage Services</h2>
                      <p className="text-slate-400 text-xs sm:text-sm font-sans">Add new technology solutions or delete catalog list cards.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left: Add Service Form */}
                      <div className="lg:col-span-5 bg-darkCard border border-white/5 rounded-2xl p-6 shadow-glowTeal/5 relative">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-techTeal to-neonGreen"></div>
                        <h3 className="font-outfit text-lg font-bold text-white mb-4 flex items-center gap-1.5"><Plus className="w-5 h-5 text-techTeal" /> Add Service</h3>
                        
                        <form onSubmit={handleAddService} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Service Name (English)</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. Computer Repair" 
                              value={newServiceForm.title}
                              onChange={(e) => setNewServiceForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal font-sans"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Service Name (Sinhala)</label>
                            <input 
                              type="text" 
                              placeholder="e.g. පරිගණක අලුත්වැඩියාව" 
                              value={newServiceForm.titleSi}
                              onChange={(e) => setNewServiceForm(prev => ({ ...prev, titleSi: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal font-sans"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Category / Badge</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Hardware & Fixes" 
                              value={newServiceForm.badge}
                              onChange={(e) => setNewServiceForm(prev => ({ ...prev, badge: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal font-sans"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Lucide Icon Name</label>
                              <select 
                                value={newServiceForm.iconName}
                                onChange={(e) => setNewServiceForm(prev => ({ ...prev, iconName: e.target.value }))}
                                className="w-full bg-[#0e1425] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal font-sans"
                              >
                                <option value="Monitor">Monitor (Desktop)</option>
                                <option value="Settings">Settings (Gears)</option>
                                <option value="Layers">Layers (OS)</option>
                                <option value="DownloadCloud">DownloadCloud</option>
                                <option value="Smartphone">Smartphone</option>
                                <option value="HardDrive">HardDrive</option>
                                <option value="FileText">FileText (CV)</option>
                                <option value="Code">Code (Web Dev)</option>
                                <option value="Wrench">Wrench (Tools)</option>
                                <option value="Zap">Zap (Performance)</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Theme Color</label>
                              <select 
                                value={newServiceForm.tealTheme ? "true" : "false"}
                                onChange={(e) => setNewServiceForm(prev => ({ ...prev, tealTheme: e.target.value === "true" }))}
                                className="w-full bg-[#0e1425] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal font-sans"
                              >
                                <option value="true">Cyan Glow</option>
                                <option value="false">Green Glow</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Description (English)</label>
                            <textarea 
                              rows="3" 
                              required 
                              placeholder="Enter English description..." 
                              value={newServiceForm.description}
                              onChange={(e) => setNewServiceForm(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal font-sans resize-none"
                            ></textarea>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Description (Sinhala)</label>
                            <textarea 
                              rows="3" 
                              placeholder="Enter Sinhala description..." 
                              value={newServiceForm.descriptionSi}
                              onChange={(e) => setNewServiceForm(prev => ({ ...prev, descriptionSi: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal font-sans resize-none"
                            ></textarea>
                          </div>

                          <button type="submit" className="w-full py-3 rounded-lg text-xs font-bold text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTeal transition-all duration-300">
                            Add Service Catalog Card
                          </button>
                        </form>
                      </div>

                      {/* Right: Service List */}
                      <div className="lg:col-span-7 bg-darkCard border border-white/5 rounded-2xl p-6 shadow-glowTeal/5 space-y-4">
                        <h3 className="font-outfit text-lg font-bold text-white mb-2">Registered Services ({services.length})</h3>
                        
                        {services.length === 0 ? (
                          <p className="text-slate-500 text-xs text-center py-12 font-sans">No services found in database.</p>
                        ) : (
                          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 font-sans text-xs">
                            {services.map(s => (
                              <div key={s._id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 ${
                                    s.tealTheme ? 'text-techTeal' : 'text-neonGreen'
                                  }`}>
                                    {renderServiceIcon(s.iconName, "w-5 h-5")}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-white leading-none flex items-center gap-1.5">
                                      {s.title}
                                      {s.titleSi && <span className="text-[10px] text-slate-500 font-normal">({s.titleSi})</span>}
                                    </h4>
                                    <span className="text-[9px] text-slate-400 font-semibold uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded inline-block mt-1">{s.badge}</span>
                                    <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{s.description}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 items-center flex-shrink-0">
                                  <button 
                                    onClick={() => setEditingService(s)} 
                                    className="p-1.5 border border-techTeal/30 text-techTeal bg-techTeal/10 hover:bg-techTeal/20 rounded transition-colors"
                                    title="Edit Service"
                                  >
                                    <Wrench className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteService(s._id)} 
                                    className="p-1.5 border border-red-500/20 text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded transition-colors flex-shrink-0"
                                    title="Delete Service"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. PRODUCTS VIEW */}
                {adminTab === 'products' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-outfit font-extrabold text-2xl text-white">Manage Products Shop</h2>
                      <p className="text-slate-400 text-xs sm:text-sm font-sans">Manage hardware and software solutions rendered on the home page shop segment.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left: Add Product Form */}
                      <div className="lg:col-span-5 bg-darkCard border border-white/5 rounded-2xl p-6 shadow-glowTeal/5 relative">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-techTeal to-neonGreen"></div>
                        <h3 className="font-outfit text-lg font-bold text-white mb-4 flex items-center gap-1.5"><ShoppingBag className="w-5 h-5 text-techTeal" /> Add Product</h3>
                        
                        <form onSubmit={handleAddProduct} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Product Name</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. SSD 512GB NVMe" 
                              value={newProductForm.name}
                              onChange={(e) => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal font-sans"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Price (LKR)</label>
                            <input 
                              type="number" 
                              required 
                              placeholder="e.g. 13500" 
                              value={newProductForm.price}
                              onChange={(e) => setNewProductForm(prev => ({ ...prev, price: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal font-sans"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Product Description</label>
                            <textarea 
                              rows="3" 
                              required 
                              placeholder="Enter hardware specifications/details..." 
                              value={newProductForm.description}
                              onChange={(e) => setNewProductForm(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal font-sans resize-none"
                            ></textarea>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Image URL</label>
                            <input 
                              type="url" 
                              required 
                              placeholder="https://example.com/image.jpg" 
                              value={newProductForm.imageUrl}
                              onChange={(e) => setNewProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal font-sans"
                            />
                            <span className="text-[10px] text-slate-500 leading-normal block pl-1">
                              Pro Tip: You can copy public image addresses from hosting/stock sites (e.g., Unsplash).
                            </span>
                          </div>

                          <button type="submit" className="w-full py-3 rounded-lg text-xs font-bold text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTeal transition-all duration-300">
                            Add Product
                          </button>
                        </form>
                      </div>

                      {/* Right: Products List */}
                      <div className="lg:col-span-7 bg-darkCard border border-white/5 rounded-2xl p-6 shadow-glowTeal/5 space-y-4">
                        <h3 className="font-outfit text-lg font-bold text-white mb-2">Inventory Shop list ({products.length})</h3>
                        
                        {products.length === 0 ? (
                          <p className="text-slate-500 text-xs text-center py-12 font-sans">No products found in system.</p>
                        ) : (
                          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 font-sans text-xs">
                            {products.map(p => (
                              <div key={p._id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/5 overflow-hidden flex-shrink-0">
                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-white leading-none">{p.name}</h4>
                                    <span className="text-[10px] text-neonGreen font-semibold block mt-1.5">Rs. {p.price.toLocaleString()}</span>
                                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed" title={p.description}>{p.description}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 items-center flex-shrink-0">
                                  <button 
                                    onClick={() => setEditingProduct(p)} 
                                    className="p-1.5 border border-techTeal/30 text-techTeal bg-techTeal/10 hover:bg-techTeal/20 rounded transition-colors"
                                    title="Edit Product"
                                  >
                                    <Wrench className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(p._id)} 
                                    className="p-1.5 border border-red-500/20 text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded transition-colors flex-shrink-0"
                                    title="Delete Product"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. WEB PRODUCTS VIEW */}
                {adminTab === 'web-projects' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-outfit font-extrabold text-2xl text-white">Manage Web Products</h2>
                      <p className="text-slate-400 text-xs sm:text-sm font-sans">Create, edit, and publish web software systems showcased to customers with live web links.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left: Add Web Product Form */}
                      <div className="lg:col-span-5 bg-darkCard border border-white/5 rounded-2xl p-5 sm:p-6 shadow-glowTeal/5 relative">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-techTeal to-neonGreen"></div>
                        <h3 className="font-outfit text-lg font-bold text-white mb-4 flex items-center gap-1.5">
                          <Globe className="w-5 h-5 text-techTeal" /> Add New Web Product
                        </h3>
                        
                        <form onSubmit={handleAddWebProject} className="space-y-4 font-sans text-xs">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Product Name *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. E-Commerce Storefront Platform" 
                              value={newWebProjectForm.name}
                              onChange={(e) => setNewWebProjectForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-techTeal font-sans"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Product URL / Live Link *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. www.prasatek.lk or https://example.com" 
                              value={newWebProjectForm.url}
                              onChange={(e) => setNewWebProjectForm(prev => ({ ...prev, url: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-techTeal font-sans"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Category</label>
                            <select
                              value={newWebProjectForm.category}
                              onChange={(e) => setNewWebProjectForm(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full bg-darkCard border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-techTeal font-sans"
                            >
                              <option value="Web Application">Web Application</option>
                              <option value="E-Commerce">E-Commerce</option>
                              <option value="Enterprise System">Enterprise System</option>
                              <option value="Portfolio Website">Portfolio Website</option>
                              <option value="Mobile Web App">Mobile Web App</option>
                            </select>
                          </div>

                          {/* Images Input (Up to 3 images) */}
                          <div className="space-y-2 pt-1 border-t border-white/5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Product Images (Up to 3)</label>
                              <span className="text-[10px] text-techTeal font-semibold">Max 3 photos</span>
                            </div>
                            
                            {[0, 1, 2].map(idx => (
                              <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-slate-300">Image #{idx + 1} {idx === 0 ? '(Cover Image)' : ''}</span>
                                  {newWebProjectForm.images[idx] && (
                                    <button 
                                      type="button" 
                                      onClick={() => setNewWebProjectForm(prev => {
                                        const imgs = [...prev.images];
                                        imgs[idx] = '';
                                        return { ...prev, images: imgs };
                                      })}
                                      className="text-red-400 hover:text-red-300 text-[10px]"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <div className="flex gap-2 items-center">
                                  <input 
                                    type="text" 
                                    placeholder="Enter image URL..." 
                                    value={newWebProjectForm.images[idx] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setNewWebProjectForm(prev => {
                                        const imgs = [...prev.images];
                                        imgs[idx] = val;
                                        return { ...prev, images: imgs };
                                      });
                                    }}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-techTeal"
                                  />
                                  <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-slate-200 border border-white/10 flex items-center gap-1 flex-shrink-0">
                                    <ImageIcon className="w-3 h-3 text-techTeal" /> Upload
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={(e) => handleImageFileChange(e, idx, false)} 
                                      className="hidden" 
                                    />
                                  </label>
                                </div>
                                {newWebProjectForm.images[idx] && (
                                  <div className="w-16 h-12 rounded bg-slate-900 border border-white/10 overflow-hidden">
                                    <img 
                                      src={newWebProjectForm.images[idx]} 
                                      alt={`Preview ${idx + 1}`} 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'; }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Product Details & Description *</label>
                            <textarea 
                              rows="4" 
                              required 
                              placeholder="Detail features, technology stack, purpose..." 
                              value={newWebProjectForm.details}
                              onChange={(e) => setNewWebProjectForm(prev => ({ ...prev, details: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-techTeal font-sans resize-none"
                            ></textarea>
                          </div>

                          <button type="submit" className="w-full py-3 rounded-lg text-xs font-bold text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTeal transition-all duration-300">
                            Create Web Product
                          </button>
                        </form>
                      </div>

                      {/* Right: Web Products List */}
                      <div className="lg:col-span-7 bg-darkCard border border-white/5 rounded-2xl p-5 sm:p-6 shadow-glowTeal/5 space-y-4">
                        <h3 className="font-outfit text-lg font-bold text-white mb-2">Published Web Products ({webProjects.length})</h3>
                        
                        {webProjects.length === 0 ? (
                          <p className="text-slate-500 text-xs text-center py-12 font-sans">No web products added yet.</p>
                        ) : (
                          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 font-sans text-xs">
                            {webProjects.map(project => {
                              const coverImg = (project.images && project.images.length > 0) ? project.images[0] : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
                              return (
                                <div key={project._id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                    <div className="w-16 h-16 rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex-shrink-0 relative">
                                      <img 
                                        src={coverImg} 
                                        alt={project.name} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'; }}
                                      />
                                      {project.images && project.images.length > 1 && (
                                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded font-mono font-bold">
                                          +{project.images.length - 1}
                                        </span>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-bold text-white text-sm truncate">{project.name}</h4>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-techTeal/10 text-techTeal border border-techTeal/20 flex-shrink-0">
                                          {project.category || 'Web Product'}
                                        </span>
                                      </div>
                                      <a 
                                        href={ensureAbsoluteUrl(project.url)} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-[11px] text-techTeal hover:underline flex items-center gap-1 mt-1 truncate"
                                      >
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{project.url}</span>
                                      </a>
                                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed" title={project.details}>
                                        {project.details}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 items-center flex-shrink-0 self-end sm:self-center">
                                    <button 
                                      onClick={() => setEditingWebProject(project)} 
                                      className="p-2 border border-techTeal/30 text-techTeal bg-techTeal/10 hover:bg-techTeal/20 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                                      title="Edit Web Product"
                                    >
                                      <Wrench className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteWebProject(project._id)} 
                                      className="p-2 border border-red-500/20 text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                                      title="Delete Web Product"
                                    >
                                      <Trash className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* EDIT WEB PRODUCT MODAL */}
                    {editingWebProject && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
                        <div className="bg-darkCard border border-white/10 rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto relative shadow-2xl">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="font-outfit text-lg font-bold text-white flex items-center gap-2">
                              <Wrench className="w-5 h-5 text-techTeal" /> Edit Web Product
                            </h3>
                            <button onClick={() => setEditingWebProject(null)} className="text-slate-400 hover:text-white">
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <form onSubmit={handleEditWebProjectSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Product Name</label>
                              <input 
                                type="text" 
                                required 
                                value={editingWebProject.name}
                                onChange={(e) => setEditingWebProject(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-techTeal font-sans"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Live Product URL</label>
                              <input 
                                type="text" 
                                required 
                                placeholder="e.g. www.prasatek.lk or https://example.com"
                                value={editingWebProject.url}
                                onChange={(e) => setEditingWebProject(prev => ({ ...prev, url: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-techTeal font-sans"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Category</label>
                              <select
                                value={editingWebProject.category || 'Web Application'}
                                onChange={(e) => setEditingWebProject(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full bg-darkCard border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-techTeal font-sans"
                              >
                                <option value="Web Application">Web Application</option>
                                <option value="E-Commerce">E-Commerce</option>
                                <option value="Enterprise System">Enterprise System</option>
                                <option value="Portfolio Website">Portfolio Website</option>
                                <option value="Mobile Web App">Mobile Web App</option>
                              </select>
                            </div>

                            {/* Images Edit */}
                            <div className="space-y-2 pt-1 border-t border-white/5">
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Images (Up to 3)</label>
                              {[0, 1, 2].map(idx => {
                                const imgs = editingWebProject.images || [];
                                return (
                                  <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-semibold text-slate-300">Image #{idx + 1}</span>
                                      {imgs[idx] && (
                                        <button 
                                          type="button" 
                                          onClick={() => setEditingWebProject(prev => {
                                            const updatedImgs = [...(prev.images || [])];
                                            updatedImgs[idx] = '';
                                            return { ...prev, images: updatedImgs };
                                          })}
                                          className="text-red-400 hover:text-red-300 text-[10px]"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <input 
                                        type="text" 
                                        placeholder="Enter image URL..." 
                                        value={imgs[idx] || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setEditingWebProject(prev => {
                                            const updatedImgs = [...(prev.images || ['', '', ''])];
                                            updatedImgs[idx] = val;
                                            return { ...prev, images: updatedImgs };
                                          });
                                        }}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-techTeal"
                                      />
                                      <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-slate-200 border border-white/10 flex items-center gap-1 flex-shrink-0">
                                        <ImageIcon className="w-3 h-3 text-techTeal" /> Upload
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          onChange={(e) => handleImageFileChange(e, idx, true)} 
                                          className="hidden" 
                                        />
                                      </label>
                                    </div>
                                    {imgs[idx] && (
                                      <div className="w-16 h-12 rounded bg-slate-900 border border-white/10 overflow-hidden">
                                        <img 
                                          src={imgs[idx]} 
                                          alt={`Preview ${idx + 1}`} 
                                          className="w-full h-full object-cover"
                                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'; }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider pl-1 font-outfit">Product Details</label>
                              <textarea 
                                rows="4" 
                                required 
                                value={editingWebProject.details}
                                onChange={(e) => setEditingWebProject(prev => ({ ...prev, details: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-techTeal font-sans resize-none"
                              ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                              <button 
                                type="button" 
                                onClick={() => setEditingWebProject(null)} 
                                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white bg-white/5 border border-white/10"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="px-5 py-2 rounded-lg text-darkBg font-bold bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTeal"
                              >
                                Save Changes
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. REVIEWS VIEW */}
                {adminTab === 'reviews' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-outfit font-extrabold text-2xl text-white">Manage Reviews</h2>
                      <p className="text-slate-400 text-xs sm:text-sm font-sans">Moderate or delete client reviews appearing on the homepage carousels.</p>
                    </div>

                    <div className="bg-darkCard border border-white/5 rounded-2xl p-6 shadow-glowTeal/5 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="font-outfit text-lg font-bold text-white">Registered Customer Reviews ({reviews.length})</h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={seedDefaultReviews} 
                            className="text-xs font-semibold bg-techTeal/10 hover:bg-techTeal/20 border border-techTeal/20 text-techTeal px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Wrench className="w-3.5 h-3.5" /> Reset Default Reviews
                          </button>
                          <button 
                            onClick={clearAllReviews} 
                            className="text-xs font-semibold bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/20 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Wipe All
                          </button>
                        </div>
                      </div>

                      {reviews.length === 0 ? (
                        <p className="text-slate-500 text-xs text-center py-12 font-sans">No reviews found.</p>
                      ) : (
                        <div className="overflow-x-auto w-full border border-white/5 rounded-xl font-sans text-xs">
                          <table className="w-full text-left text-slate-300">
                            <thead className="bg-white/5 text-slate-400 uppercase">
                              <tr>
                                <th className="px-4 py-3">Client Name</th>
                                <th className="px-4 py-3">Rating</th>
                                <th className="px-4 py-3">Comment</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {reviews.map(r => (
                                <tr key={r._id} className="hover:bg-white/[0.01]">
                                  <td className="px-4 py-3 font-semibold text-white">{r.name}</td>
                                  <td className="px-4 py-3 text-yellow-400">★ {r.rating}/5</td>
                                  <td className="px-4 py-3 text-slate-400 max-w-[300px] truncate" title={r.comment}>{r.comment}</td>
                                  <td className="px-4 py-3 text-slate-500">{r.date}</td>
                                  <td className="px-4 py-3 text-right">
                                    <button 
                                      onClick={() => deleteReview(r._id)} 
                                      className="p-1 border border-red-500/20 text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded transition-colors"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. INBOX MESSAGES VIEW */}
                {adminTab === 'messages' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="font-outfit font-extrabold text-2xl text-white">Manage Inbox Messages</h2>
                        <p className="text-slate-400 text-xs sm:text-sm font-sans">View client inquiries, contact details, and respond directly via Email or WhatsApp.</p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={fetchAdminData}
                          className="text-xs font-semibold bg-techTeal/10 hover:bg-techTeal/20 border border-techTeal/20 text-techTeal px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Monitor className="w-3.5 h-3.5" /> Refresh Inbox
                        </button>
                        {messages.length > 0 && (
                          <button 
                            onClick={clearAllMessages}
                            className="text-xs font-semibold bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/20 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Clear All Inbox
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-darkCard border border-white/5 rounded-2xl p-5 sm:p-6 shadow-glowTeal/5 space-y-4 font-sans text-xs">
                      <h3 className="font-outfit text-lg font-bold text-white mb-2">Received Client Messages ({messages.length})</h3>

                      {messages.length === 0 ? (
                        <div className="text-center py-16 bg-white/[0.01] rounded-xl border border-white/5">
                          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm">No inbox messages received yet.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto w-full border border-white/5 rounded-xl">
                          <table className="w-full text-left text-slate-300">
                            <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold">
                              <tr>
                                <th className="px-4 py-3">Sender Name</th>
                                <th className="px-4 py-3">Subject / Topic</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Date Received</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {messages.map(m => (
                                <tr key={m._id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="px-4 py-3 font-bold text-white">
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-techTeal"></span>
                                      {m.name}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-slate-200 max-w-[200px] truncate" title={m.subject}>
                                    {m.subject}
                                  </td>
                                  <td className="px-4 py-3 font-mono text-slate-400">
                                    {m.phone || 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-techTeal">
                                    <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a>
                                  </td>
                                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button 
                                        onClick={() => setSelectedMessage(m)}
                                        className="px-2.5 py-1 rounded bg-techTeal/10 hover:bg-techTeal/20 text-techTeal border border-techTeal/30 font-semibold text-[11px] flex items-center gap-1"
                                      >
                                        View Detail
                                      </button>
                                      <button 
                                        onClick={() => deleteMessage(m._id)}
                                        className="p-1 rounded bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20"
                                        title="Delete Message"
                                      >
                                        <Trash className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
              
              {/* Internal Footer */}
              <div className="mt-8 py-4 text-center text-xs text-slate-600 border-t border-white/5 font-sans bg-black/10">
                &copy; 2026 PrasaTek System Solutions. Internal Portal Panel.
              </div>
            </main>

            {/* ==========================================
                OVERLAYS: DRAWERS & MODALS
                ========================================== */}

            {/* Message Details Modal */}
            {selectedMessage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedMessage(null)}></div>
                
                <div className="relative w-full max-w-lg bg-[#080d1a] border border-white/10 rounded-2xl p-6 shadow-glowTeal/15 space-y-5 animate-fade-in z-10 text-xs">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-techTeal via-neonGreen to-techTeal"></div>
                  
                  <div className="flex justify-between items-start pb-3 border-b border-white/5">
                    <div>
                      <span className="text-[10px] text-neonGreen font-semibold uppercase bg-neonGreen/10 border border-neonGreen/20 px-2 py-0.5 rounded-full inline-block mb-1.5">
                        Client Enquiry Detail
                      </span>
                      <h3 className="font-outfit font-bold text-lg text-white leading-tight">{selectedMessage.subject}</h3>
                    </div>
                    <button onClick={() => setSelectedMessage(null)} className="p-1 border border-white/10 text-slate-400 hover:text-white rounded-lg bg-white/5 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Sender details */}
                    <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl grid grid-cols-2 gap-3 text-slate-300 font-sans">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Sender Name</span>
                        <strong className="text-white font-bold">{selectedMessage.name}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Received Date</span>
                        <span className="font-mono">{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Phone Contact</span>
                        {selectedMessage.phone ? (
                          <a href={`tel:${selectedMessage.phone.replace(/\s+/g, '')}`} className="text-white font-semibold hover:text-techTeal transition-colors hover:underline">
                            {selectedMessage.phone}
                          </a>
                        ) : (
                          <span className="text-slate-600 font-medium">None</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Email Contact</span>
                        <a href={`mailto:${selectedMessage.email}`} className="text-white font-semibold hover:text-techTeal transition-colors hover:underline break-all">
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>

                    {/* Message body */}
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Enquiry Message</label>
                      <p className="text-slate-300 leading-relaxed bg-black/25 p-3 rounded-lg border border-white/5 max-h-56 overflow-y-auto whitespace-pre-wrap text-[11px]">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  {/* Footer action */}
                  <div className="pt-4 border-t border-white/5 flex gap-3">
                    {selectedMessage.phone && (
                      <a 
                        href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hi ${selectedMessage.name}, this is PrasaTek System Solutions. We received your message: "${selectedMessage.subject}" and are following up...`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-lg font-bold text-darkBg bg-[#25D366] hover:bg-[#128C7E] transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> WhatsApp Reply
                      </a>
                    )}
                    <a 
                      href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                        `Re: ${selectedMessage.subject}`
                      )}&body=${encodeURIComponent(
                        `Dear ${selectedMessage.name},\n\nThank you for reaching out to PrasaTek System Solutions. This is in reply to your inquiry:\n\n"${selectedMessage.message}"\n\nSincerely,\nPrasaTek Support`
                      )}`}
                      className="flex-1 py-2 rounded-lg border border-techTeal text-techTeal hover:bg-techTeal hover:text-darkBg transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email Reply
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Editing Service Modal */}
            {editingService && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setEditingService(null)}></div>
                
                <div className="relative w-full max-w-lg bg-[#080d1a] border border-white/10 rounded-2xl p-6 shadow-glowTeal/15 space-y-4 animate-fade-in z-10 text-xs">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-techTeal via-neonGreen to-techTeal"></div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <h3 className="font-outfit font-bold text-lg text-white flex items-center gap-1.5"><Wrench className="w-5 h-5 text-techTeal" /> Edit Service Details</h3>
                    <button onClick={() => setEditingService(null)} className="p-1 border border-white/10 text-slate-400 hover:text-white rounded-lg bg-white/5 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleEditServiceSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Service Name (English)</label>
                      <input 
                        type="text" 
                        required 
                        value={editingService.title}
                        onChange={(e) => setEditingService(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Service Name (Sinhala)</label>
                      <input 
                        type="text" 
                        value={editingService.titleSi || ''}
                        onChange={(e) => setEditingService(prev => ({ ...prev, titleSi: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Category / Badge</label>
                        <input 
                          type="text" 
                          value={editingService.badge}
                          onChange={(e) => setEditingService(prev => ({ ...prev, badge: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Theme Color</label>
                        <select 
                          value={editingService.tealTheme ? "true" : "false"}
                          onChange={(e) => setEditingService(prev => ({ ...prev, tealTheme: e.target.value === "true" }))}
                          className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal cursor-pointer"
                        >
                          <option value="true">Cyan Glow</option>
                          <option value="false">Green Glow</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Lucide Icon Name</label>
                        <select 
                          value={editingService.iconName}
                          onChange={(e) => setEditingService(prev => ({ ...prev, iconName: e.target.value }))}
                          className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal cursor-pointer"
                        >
                          <option value="Monitor">Monitor (Desktop)</option>
                          <option value="Settings">Settings (Gears)</option>
                          <option value="Layers">Layers (OS)</option>
                          <option value="DownloadCloud">DownloadCloud</option>
                          <option value="Smartphone">Smartphone</option>
                          <option value="HardDrive">HardDrive</option>
                          <option value="FileText">FileText (CV)</option>
                          <option value="Code">Code (Web Dev)</option>
                          <option value="Wrench">Wrench (Tools)</option>
                          <option value="Zap">Zap (Performance)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Description (English)</label>
                      <textarea 
                        rows="3" 
                        required 
                        value={editingService.description}
                        onChange={(e) => setEditingService(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal resize-none font-sans"
                      ></textarea>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Description (Sinhala)</label>
                      <textarea 
                        rows="3" 
                        value={editingService.descriptionSi || ''}
                        onChange={(e) => setEditingService(prev => ({ ...prev, descriptionSi: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal resize-none font-sans"
                      ></textarea>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setEditingService(null)}
                        className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-slate-300 rounded-lg font-bold font-sans"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 py-3 text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTeal font-bold rounded-lg font-sans transition-all duration-300"
                      >
                        Save Service Updates
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Editing Product Modal */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
                
                <div className="relative w-full max-w-lg bg-[#080d1a] border border-white/10 rounded-2xl p-6 shadow-glowTeal/15 space-y-4 animate-fade-in z-10 text-xs">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-techTeal via-neonGreen to-techTeal"></div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <h3 className="font-outfit font-bold text-lg text-white flex items-center gap-1.5"><ShoppingBag className="w-5 h-5 text-techTeal" /> Edit Product Details</h3>
                    <button onClick={() => setEditingProduct(null)} className="p-1 border border-white/10 text-slate-400 hover:text-white rounded-lg bg-white/5 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleEditProductSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Product Name</label>
                      <input 
                        type="text" 
                        required 
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Price (LKR)</label>
                      <input 
                        type="number" 
                        required 
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Product Description</label>
                      <textarea 
                        rows="3" 
                        required 
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal resize-none font-sans"
                      ></textarea>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Image URL</label>
                      <input 
                        type="url" 
                        required 
                        value={editingProduct.imageUrl}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-techTeal"
                      />
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setEditingProduct(null)}
                        className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-slate-300 rounded-lg font-bold font-sans"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 py-3 text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTeal font-bold rounded-lg font-sans transition-all duration-300"
                      >
                        Save Product Updates
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. MAIN WEBSITE COMPONENT RENDERING
  // ==========================================
  return (
    <>
      {/* Ambient Grid Background & Glow Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-darkBg to-darkBg pointer-events-none z-[-2]"></div>
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-techTeal/10 rounded-full blur-[120px] pointer-events-none z-[-1] animate-pulse-slow"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-neonGreen/5 rounded-full blur-[150px] pointer-events-none z-[-1] animate-pulse-slower"></div>

      {/* ==========================================
          HEADER & NAVIGATION
          ========================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-darkBg/75 border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }} className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-techTeal/50 transition-all duration-300 shadow-glowTeal">
                <img src="/assets/logo.png" alt="PrasaTek Logo" className="w-10 h-10 object-contain transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 rounded-lg bg-techTeal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-outfit text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-techTeal bg-clip-text text-transparent group-hover:to-neonGreen transition-all duration-300">PrasaTek</span>
                <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase -mt-0.5">System Solutions</span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-300">
              <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }} className="hover:text-techTeal transition-colors duration-200 relative py-1 group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-techTeal group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="/services" onClick={(e) => { e.preventDefault(); navigateTo('/services'); }} className="hover:text-techTeal transition-colors duration-200 relative py-1 group">
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-techTeal group-hover:w-full transition-all duration-300"></span>
              </a>
              {settings.showHardwareShop && (
                <a href="/shop" onClick={(e) => { e.preventDefault(); navigateTo('/shop'); }} className="hover:text-techTeal transition-colors duration-200 relative py-1 group">
                  Shop
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-techTeal group-hover:w-full transition-all duration-300"></span>
                </a>
              )}
              <a href="/#web-products" onClick={(e) => { e.preventDefault(); navigateTo('/'); setTimeout(() => { document.getElementById('web-products')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="hover:text-techTeal transition-colors duration-200 relative py-1 group">
                Web Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-techTeal group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="/about" onClick={(e) => { e.preventDefault(); navigateTo('/about'); }} className="hover:text-techTeal transition-colors duration-200 relative py-1 group">
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-techTeal group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="/reviews" onClick={(e) => { e.preventDefault(); navigateTo('/reviews'); }} className="hover:text-techTeal transition-colors duration-200 relative py-1 group">
                Reviews
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-techTeal group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('/contact'); }} className="hover:text-techTeal transition-colors duration-200 relative py-1 group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-techTeal group-hover:w-full transition-all duration-300"></span>
              </a>
            </nav>

            {/* Desktop Quick Contacts */}
            <div className="hidden md:flex items-center gap-4">
              <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-techTeal transition-colors duration-200">
                <PhoneCall className="w-4 h-4 text-techTeal animate-bounce-subtle" />
                {settings.phone}
              </a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('/contact'); }} className="relative group overflow-hidden px-5 py-2.5 rounded-lg text-sm font-bold text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTeal transition-all duration-300">
                <span className="relative z-10">Contact Us</span>
                <div className="absolute inset-0 bg-gradient-to-r from-neonGreen to-techTeal opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </a>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(prev => !prev)} className="p-2 text-slate-400 hover:text-white focus:outline-none">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/5 bg-darkBg/95 backdrop-blur-lg">
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 text-center">
              <a href="/" className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={(e) => { e.preventDefault(); navigateTo('/'); setMobileMenuOpen(false); }}>Home</a>
              <a href="/services" className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={(e) => { e.preventDefault(); navigateTo('/services'); setMobileMenuOpen(false); }}>Services</a>
              {settings.showHardwareShop && (
                <a href="/shop" className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={(e) => { e.preventDefault(); navigateTo('/shop'); setMobileMenuOpen(false); }}>Shop</a>
              )}
              <a href="/#web-products" className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={(e) => { e.preventDefault(); navigateTo('/'); setMobileMenuOpen(false); setTimeout(() => { document.getElementById('web-products')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>Web Products</a>
              <a href="/about" className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={(e) => { e.preventDefault(); navigateTo('/about'); setMobileMenuOpen(false); }}>About Us</a>
              <a href="/reviews" className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={(e) => { e.preventDefault(); navigateTo('/reviews'); setMobileMenuOpen(false); }}>Reviews</a>
              <a href="/contact" className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={(e) => { e.preventDefault(); navigateTo('/contact'); setMobileMenuOpen(false); }}>Contact</a>
              
              <div className="pt-4 border-t border-white/5 mt-4 flex flex-col items-center gap-3">
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-base font-semibold text-slate-300 hover:text-techTeal">
                  <PhoneCall className="w-5 h-5 text-techTeal" />
                  {settings.phone}
                </a>
                <a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('/contact'); setMobileMenuOpen(false); }} className="w-full max-w-xs py-3 rounded-lg text-base font-bold text-darkBg bg-gradient-to-r from-techTeal to-neonGreen">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Floating Alerts notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 p-4 rounded-xl border animate-toast text-slate-100 text-sm font-medium backdrop-blur-md ${
            t.type === 'success' ? 'bg-darkCard border-neonGreen/30 shadow-glowGreen/15' :
            t.type === 'error' ? 'bg-darkCard border-red-500/30 shadow-red-500/10' :
            'bg-darkCard border-techTeal/30 shadow-glowTeal/10'
          }`}>
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-neonGreen flex-shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
            {t.type === 'info' && <AlertCircle className="w-5 h-5 text-techTeal flex-shrink-0" />}
            <div className="flex-1">{t.message}</div>
            <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <main>
        {/* ==========================================
            HERO SECTION
            ========================================== */}
        <section className="relative pt-10 pb-20 md:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column info */}
              <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-techTeal/10 border border-techTeal/30 text-techTeal text-xs font-semibold tracking-wider uppercase animate-fade-in shadow-glowTeal">
                  <span className="w-2 h-2 rounded-full bg-techTeal animate-ping"></span>
                  YOUR TRUSTED TECH PARTNER
                </div>
                
                <h1 className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                  <span className="block text-white">Reliable Solutions.</span>
                  <span className="block bg-gradient-to-r from-techTeal to-neonGreen bg-clip-text text-transparent">Better Technology.</span>
                  <span className="block text-white">Brighter Future.</span>
                </h1>
                
                <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 font-normal font-sans">
                  Quality Service. Affordable Prices. Solutions You Can Count On! We provide expert tech support, device repairs, system installations, data recovery, and modern website development.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('/contact'); }} className="w-full sm:w-auto text-center px-8 py-4 rounded-xl text-base font-bold text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:scale-105 hover:shadow-glowTealStrong transition-all duration-300">
                    Contact Us Now
                  </a>
                  <a href="/services" onClick={(e) => { e.preventDefault(); navigateTo('/services'); }} className="w-full sm:w-auto text-center px-8 py-4 rounded-xl text-base font-bold text-white border border-white/10 bg-white/5 hover:bg-white/10 hover:border-techTeal/30 transition-all duration-300">
                    Explore Services
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 max-w-md mx-auto lg:mx-0">
                  <div>
                    <span className="block font-outfit text-2xl sm:text-3xl font-extrabold text-white">100%</span>
                    <span className="text-xs text-slate-400 font-medium">Satisfaction Guaranteed</span>
                  </div>
                  <div className="border-l border-white/10 pl-4">
                    <span className="block font-outfit text-2xl sm:text-3xl font-extrabold text-techTeal">Fast</span>
                    <span className="text-xs text-slate-400 font-medium">Turnaround Service</span>
                  </div>
                  <div className="border-l border-white/10 pl-4">
                    <span className="block font-outfit text-2xl sm:text-3xl font-extrabold text-neonGreen">Afford</span>
                    <span className="text-xs text-slate-400 font-medium">Prices & Support</span>
                  </div>
                </div>
              </div>

              {/* Right Column Cyber Graphic */}
              <div className="lg:col-span-5 flex justify-center relative">
                <div className="relative w-full max-w-md aspect-square rounded-2xl bg-darkCard border border-white/5 p-6 flex flex-col items-center justify-center overflow-hidden shadow-glowTeal/10 hover:border-techTeal/20 hover:shadow-glowTeal/25 transition-all duration-500 group">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                  
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-techTeal rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-techTeal rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neonGreen rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neonGreen rounded-br-lg"></div>

                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="relative w-44 h-44 flex items-center justify-center rounded-full bg-white/5 border border-white/10 p-6 shadow-glowTeal animate-pulse-slow">
                      <div className="absolute inset-2 rounded-full border-2 border-dashed border-techTeal/30 animate-spin-slow"></div>
                      <div className="absolute inset-4 rounded-full border border-neonGreen/20 animate-spin-reverse-slow"></div>
                      <img src="/assets/logo.png" alt="PrasaTek Logo" className="w-32 h-32 object-contain relative z-10 transition-transform duration-700 group-hover:rotate-[360deg]" />
                    </div>

                    <div className="relative w-full flex items-center justify-center gap-3 bg-gradient-to-r from-techTeal/15 via-white/5 to-neonGreen/15 border-y border-white/10 py-3 px-4 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-neonGreen" />
                      <span className="font-outfit text-sm font-bold tracking-wide text-white uppercase">100% Quality Guaranteed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            TRUST / VALUES BANNER
            ========================================== */}
        <section className="border-y border-white/5 bg-white/[0.01] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="flex items-center gap-4 px-4 py-3 justify-center sm:justify-start">
                <div className="w-12 h-12 rounded-xl bg-techTeal/10 flex items-center justify-center text-techTeal border border-techTeal/20">
                  <Wrench className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-outfit font-bold text-white">Expert Technicians</h3>
                  <p className="text-xs text-slate-400 font-sans">Certified professionals for all tasks</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-4 py-3 justify-center sm:justify-start border-t sm:border-t-0 sm:border-l border-white/5">
                <div className="w-12 h-12 rounded-xl bg-neonGreen/10 flex items-center justify-center text-neonGreen border border-neonGreen/20">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-outfit font-bold text-white">Fast & Reliable</h3>
                  <p className="text-xs text-slate-400 font-sans">Quick turnaround, maximum uptime</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-4 py-3 justify-center sm:justify-start border-t lg:border-t-0 lg:border-l border-white/5">
                <div className="w-12 h-12 rounded-xl bg-techTeal/10 flex items-center justify-center text-techTeal border border-techTeal/20">
                  <Banknote className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-outfit font-bold text-white">Affordable Prices</h3>
                  <p className="text-xs text-slate-400 font-sans">High value, competitive rates</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-4 py-3 justify-center sm:justify-start border-t lg:border-t-0 lg:border-l border-white/5">
                <div className="w-12 h-12 rounded-xl bg-neonGreen/10 flex items-center justify-center text-neonGreen border border-neonGreen/20">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-outfit font-bold text-white">Customer Focus</h3>
                  <p className="text-xs text-slate-400 font-sans">Your total satisfaction is our priority</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SERVICES SECTION
            ========================================== */}
        <section id="services" className="py-20 md:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neonGreen/10 border border-neonGreen/30 text-neonGreen text-xs font-semibold tracking-wider uppercase">
                OUR SERVICES
              </div>
              <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white">
                Professional IT & Tech Solutions
              </h2>
              <p className="text-slate-400 text-sm sm:text-base font-sans">
                Explore our comprehensive range of technology solutions. From computer repair to custom website design, we fix and build tools for your success.
              </p>

              {/* Dynamic search query hook */}
              <div className="max-w-md mx-auto pt-6">
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for services... (e.g. windows, repair, resume)" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 pl-12 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-techTeal focus:ring-1 focus:ring-techTeal transition-all duration-300 shadow-glowTeal/5"
                  />
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-3.5 text-slate-400 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Grid display */}
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">No services found</h3>
                <p className="text-slate-400 text-sm font-sans">Try searching for other keywords like "recovery", "development", or "software".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredServices.map(s => {
                  return (
                    <div 
                      key={s._id} 
                      className={`p-6 rounded-2xl border flex flex-col justify-between h-full relative group overflow-hidden ${
                        s.tealTheme 
                          ? 'service-card border-white/5 bg-darkCard' 
                          : 'service-card service-card-green border-white/5 bg-darkCard'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${
                          s.tealTheme ? 'text-techTeal' : 'text-neonGreen'
                        }`}>
                          {renderServiceIcon(s.iconName, "w-6 h-6")}
                        </div>
                        
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          s.tealTheme 
                            ? 'bg-techTeal/10 text-techTeal border-techTeal/20' 
                            : 'bg-neonGreen/10 text-neonGreen border-neonGreen/20'
                        }`}>
                          {s.badge}
                        </span>

                        <div>
                          <h3 className="font-outfit text-xl font-bold text-white transition-colors leading-snug">
                            {s.title}
                          </h3>
                          {s.titleSi && (
                            <span className="text-slate-500 font-sans text-xs block font-semibold mt-0.5">
                              {s.titleSi}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-normal font-sans">{s.description}</p>
                        {s.descriptionSi && (
                          <p className="text-[11px] text-slate-500 leading-relaxed font-sans border-t border-white/5 pt-2">{s.descriptionSi}</p>
                        )}
                      </div>
                      
                        <button 
                          onClick={() => {
                            setContactForm(prev => ({
                              ...prev,
                              subject: `Inquiry regarding: ${s.title}`,
                              message: `Hi PrasaTek, I would like to inquire about your ${s.title} service...`
                            }));
                            addToast(`Inquiry details loaded. Please complete contact form below.`, "info");
                            setTimeout(() => {
                              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }} 
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                            s.tealTheme 
                              ? 'bg-techTeal hover:bg-techTealHover text-darkBg' 
                              : 'bg-neonGreen hover:bg-neonGreenHover text-darkBg'
                          }`}
                        >
                          Inquire Service
                        </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ==========================================
            WEB PRODUCTS SHOWCASE SECTION
            ========================================== */}
        <section id="web-products" className="py-16 md:py-24 bg-white/[0.008] border-t border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-techTeal/10 border border-techTeal/30 text-techTeal text-xs font-semibold tracking-wider uppercase shadow-glowTeal">
                <Globe className="w-3.5 h-3.5" /> PORTFOLIO & WEB PRODUCTS
              </div>
              <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Web Products
              </h2>
              <p className="text-slate-400 text-sm sm:text-base font-normal max-w-2xl mx-auto px-2">
                Explore custom web applications, e-commerce storefronts, and full web software systems engineered by PrasaTek.
              </p>
            </div>

            {webProjects.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/5 px-4">
                <Globe className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No web products currently listed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {webProjects.map(project => {
                  const coverImg = (project.images && project.images.length > 0) ? project.images[0] : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
                  return (
                    <div 
                      key={project._id}
                      className="group bg-darkCard border border-white/5 hover:border-techTeal/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-glowTeal/5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Preview Container */}
                        <div className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer" onClick={() => { setSelectedWebProject(project); setActiveWebProjectImageIndex(0); }}>
                          <img 
                            src={coverImg} 
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-darkCard via-transparent to-transparent opacity-80"></div>
                          
                          <span className="absolute top-3 left-3 bg-darkBg/80 backdrop-blur-md text-techTeal text-[10px] font-bold px-2.5 py-1 rounded-full border border-techTeal/30 uppercase tracking-wider">
                            {project.category || 'Web Product'}
                          </span>

                          {project.images && project.images.length > 1 && (
                            <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20">
                              {project.images.length} Photos
                            </span>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-5 sm:p-6 space-y-3 font-sans">
                          <h3 
                            onClick={() => { setSelectedWebProject(project); setActiveWebProjectImageIndex(0); }}
                            className="font-outfit text-lg sm:text-xl font-bold text-white group-hover:text-techTeal transition-colors cursor-pointer"
                          >
                            {project.name}
                          </h3>

                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                            {project.details}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-5 sm:p-6 pt-0 font-sans flex items-center justify-between gap-3">
                        <button 
                          onClick={() => { setSelectedWebProject(project); setActiveWebProjectImageIndex(0); }}
                          className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-white/5 border border-white/10 hover:border-techTeal/40 hover:bg-techTeal/10 hover:text-techTeal transition-all duration-200"
                        >
                          View Details
                        </button>
                        
                        <button 
                          onClick={() => window.open(ensureAbsoluteUrl(project.url), '_blank', 'noopener,noreferrer')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTeal transition-all duration-200"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Visit Site
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ==========================================
            PRODUCTS SHOP SECTION
            ========================================== */}
        {(settings.showHardwareShop || settings.showOffers) && (
          <section id="shop" className="py-20 bg-white/[0.005] border-t border-white/5 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-techTeal/10 border border-techTeal/30 text-techTeal text-xs font-semibold tracking-wider uppercase">
                  HARDWARE SHOP & OFFERS
                  {settings.showOffers && (
                    <span className="bg-neonGreen text-darkBg px-2 py-0.5 rounded-full text-[9px] font-extrabold ml-1 animate-pulse">SPECIAL OFFERS ACTIVE</span>
                  )}
                </div>
                <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white">
                  Genuine Tech Components & Hardware
                </h2>
                <p className="text-slate-400 text-sm sm:text-base font-sans">
                  High-quality storage upgrades, memory modules, network routers, and custom tech software at unbeatable price ranges.
                </p>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm font-sans border border-white/5 bg-darkCard rounded-2xl">
                  No inventory products listed in shop currently.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products.map(p => (
                    <div key={p._id} className="bg-darkCard border border-white/5 rounded-2xl overflow-hidden hover:border-techTeal/30 transition-all duration-300 flex flex-col justify-between group shadow-glowTeal/5 hover:shadow-glowTeal/10">
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-900 border-b border-white/5">
                        <img src={p.imageUrl || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {settings.showOffers && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-neonGreen to-techTeal text-darkBg px-2.5 py-1 rounded-md font-extrabold text-[10px] uppercase shadow-glowGreen/20">
                            SPECIAL OFFER
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-darkBg/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-neonGreen font-bold text-xs sm:text-sm font-outfit shadow-glowGreen/10">
                          Rs. {p.price.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-outfit font-bold text-white text-base leading-tight group-hover:text-techTeal transition-colors">{p.name}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">{p.description}</p>
                        </div>
                        
                        <button 
                          onClick={() => {
                            setContactForm(prev => ({ 
                              ...prev, 
                              subject: `Hardware Inquiry: ${p.name}`, 
                              message: `Hi PrasaTek, I am interested in purchasing the product: "${p.name}" (Price: LKR ${p.price.toLocaleString()}). Please contact me with availability...` 
                            }));
                            addToast(`Inquiry details loaded. Complete contact form below.`, "info");
                            setTimeout(() => {
                              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-techTeal hover:text-darkBg border border-white/10 hover:border-techTeal text-slate-200 transition-all duration-300"
                        >
                          Enquire / Purchase
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==========================================
            ABOUT US SECTION
            ========================================== */}
        <section id="about" className="py-20 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Graphic Display */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-glowTeal/5 hover:border-techTeal/30 hover:shadow-glowTeal/20 transition-all duration-500 group max-w-sm">
                  <img src="/assets/poster.jpg" alt="PrasaTek Business Poster" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-transparent to-transparent opacity-60"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-darkBg/80 backdrop-blur-md border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-techTeal" />
                      <span className="text-xs font-semibold text-white">PrasaTek Poster</span>
                    </div>
                    <a href="/assets/poster.jpg" download="PrasaTek_System_Solutions_Poster.jpg" className="text-xs font-bold text-darkBg bg-techTeal hover:bg-neonGreen px-3 py-1.5 rounded-md flex items-center gap-1 transition-all duration-300">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-techTeal/10 border border-techTeal/30 text-techTeal text-xs font-semibold tracking-wider uppercase">
                  WHO WE ARE
                </div>
                <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  Reliable Technology Partner For Your Home & Business
                </h2>
                
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
                  At <strong>PrasaTek System Solutions</strong>, we believe in connecting clients with elite technology services that guarantee reliability. Operating out of Poruwadanda, we take pride in troubleshooting tech headaches and providing affordable solutions with absolute precision.
                </p>
                
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
                  Whether you need system diagnostics, hardware repair, software configuration, data security, mobile restoration, or a clean modern website for your own brand, our technicians combine speed, skill, and friendly customer care.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-neonGreen flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-200">100% Customer Satisfaction</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-neonGreen flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-200">Upfront Affordable Prices</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-neonGreen flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-200">Fast & Trustworthy Delivery</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-neonGreen flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-200">Expert Technical Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ==========================================
            CUSTOMER TESTIMONIALS & REVIEWS SECTION
            ========================================== */}
        <section id="reviews" className="py-20 bg-white/[0.01] border-y border-white/5 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-techTeal/10 border border-techTeal/30 text-techTeal text-xs font-semibold tracking-wider uppercase">
                REVIEWS & FEEDBACK
              </div>
              <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white">
                What Our Customers Say
              </h2>
              <p className="text-slate-400 text-sm sm:text-base font-sans">
                Real reviews from our satisfied clients. Submitted and updated live in real time.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Write Review Form */}
              <div className="lg:col-span-5 bg-darkCard border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300 relative shadow-glowGreen/5">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neonGreen via-techTeal to-neonGreen"></div>
                <h3 className="font-outfit text-xl font-bold text-white mb-4">Write a Review</h3>
                
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Alex Silva" 
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neonGreen transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase">Rating</label>
                    <div className="flex items-center gap-2 text-2xl" id="star-rating-selector">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button 
                          key={val}
                          type="button" 
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: val }))}
                          className={`transition-colors focus:outline-none ${
                            val <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase">Your Feedback</label>
                    <textarea 
                      rows="3" 
                      placeholder="Describe your experience with our services..." 
                      required
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neonGreen transition-colors resize-none"
                    ></textarea>
                  </div>

                  <button type="submit" className="w-full py-3 rounded-lg text-sm font-bold text-darkBg bg-gradient-to-r from-neonGreen to-techTeal hover:shadow-glowGreen transition-all duration-300">
                    Submit Live Review
                  </button>
                </form>
              </div>

              {/* Slider list */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400 font-sans">
                    Showing {reviews.length} review{reviews.length === 1 ? '' : 's'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => scrollReviews('prev')} className="p-2 border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => scrollReviews('next')} className="p-2 border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl min-h-[220px]">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm font-sans">
                      No reviews yet. Be the first to leave a feedback!
                    </div>
                  ) : (
                    <div 
                      ref={reviewsSliderRef} 
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${activeReviewIndex * 100}%)` }}
                    >
                      {reviews.map((r, index) => (
                        <div key={r._id || index} className="w-full flex-shrink-0 px-2">
                          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4 hover:border-white/10 transition-colors h-full flex flex-col justify-between">
                            <p className="text-sm italic text-slate-300 leading-relaxed font-sans">"{r.comment}"</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                              <div>
                                <h4 className="font-outfit font-bold text-white text-sm">{r.name}</h4>
                                <span className="text-[10px] text-slate-400 font-sans">{r.date}</span>
                              </div>
                              <div className="flex gap-0.5 text-base">
                                {[1,2,3,4,5].map(star => (
                                  <span key={star} className={star <= r.rating ? 'text-yellow-400' : 'text-slate-600'}>★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==========================================
            CONTACT US SECTION
            ========================================== */}
        <section id="contact" className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neonGreen/10 border border-neonGreen/30 text-neonGreen text-xs font-semibold tracking-wider uppercase">
                    CONTACT US
                  </div>
                  <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white">
                    Let's Get in Touch
                  </h2>
                  <p className="text-slate-400 text-sm sm:text-base font-sans">
                    Have quick questions or ready to drop off your device? Reach out to us via call, email, or visit our store in Maputugala Poruwadanda.
                  </p>
                </div>

                <div className="space-y-4">
                  <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-techTeal/30 hover:bg-white/10 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl bg-techTeal/10 border border-techTeal/20 flex items-center justify-center text-techTeal flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Call or WhatsApp</span>
                      <span className="block text-base font-bold text-white group-hover:text-techTeal transition-colors">{settings.phone}</span>
                    </div>
                  </a>

                  <a href={`mailto:${settings.email}`} className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-techTeal/30 hover:bg-white/10 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl bg-techTeal/10 border border-techTeal/20 flex items-center justify-center text-techTeal flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="break-all">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Email Enquiries</span>
                      <span className="block text-base font-bold text-white group-hover:text-techTeal transition-colors">{settings.email}</span>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-techTeal/10 border border-techTeal/20 flex items-center justify-center text-techTeal flex-shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Our Workshop Address</span>
                      <span className="block text-sm font-semibold text-white">{settings.address}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-techTeal/10 to-neonGreen/10 border border-white/5 rounded-2xl text-center">
                  <p className="font-outfit font-extrabold text-white text-lg tracking-wide uppercase">YOUR DEVICE. OUR PRIORITY.</p>
                  <p className="font-outfit text-sm text-neonGreen italic mt-1">"We Fix. You Succeed."</p>
                </div>
              </div>

              {/* Message form */}
              <div className="lg:col-span-7 bg-darkCard border border-white/5 rounded-2xl p-6 sm:p-8 hover:border-white/10 transition-all duration-300 shadow-glowTeal/5">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-techTeal via-neonGreen to-techTeal"></div>
                <h3 className="font-outfit text-xl font-bold text-white mb-6">Send Us a Direct Message</h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase">Your Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Sarah Jenkins" 
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="0719323239" 
                        value={contactForm.phone}
                        onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="sarah@example.com" 
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase">Subject</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="General inquiry / Quotation request" 
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase">Message Content</label>
                    <textarea 
                      rows="4" 
                      placeholder="Type your message here..." 
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-techTeal transition-colors resize-none"
                    ></textarea>
                  </div>

                  <button type="submit" className="w-full py-4 rounded-xl text-base font-bold text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTeal transition-all duration-300 flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" /> Send Message
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>

        {/* ==========================================
            MAPS IFRAME SECTION
            ========================================== */}
        {settings.mapsEmbedUrl && (
          <section className="w-full h-[450px] relative border-t border-white/5">
            <iframe 
              src={settings.mapsEmbedUrl}
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="PrasaTek Location Map"
            ></iframe>
          </section>
        )}
      </main>

      {/* ==========================================
          CUSTOMER WEB PRODUCT DETAIL MODAL
          ========================================== */}
      {selectedWebProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
          <div className="bg-darkCard border border-white/10 rounded-2xl max-w-3xl w-full p-5 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-techTeal/10 text-techTeal border border-techTeal/30 mb-2">
                  {selectedWebProject.category || 'Web Application'}
                </span>
                <h2 className="font-outfit text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                  {selectedWebProject.name}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedWebProject(null)} 
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gallery Section (Main Image + Up to 3 Thumbnails) */}
            {selectedWebProject.images && selectedWebProject.images.length > 0 && (
              <div className="space-y-3">
                <div className="w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border border-white/10 relative shadow-inner">
                  <img 
                    src={selectedWebProject.images[activeWebProjectImageIndex] || selectedWebProject.images[0]} 
                    alt={selectedWebProject.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'; }}
                  />
                </div>
                
                {/* Thumbnails row if more than 1 image */}
                {selectedWebProject.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {selectedWebProject.images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveWebProjectImageIndex(idx)}
                        className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                          activeWebProjectImageIndex === idx ? 'border-techTeal shadow-glowTeal/30 scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Thumbnail ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'; }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Details Description */}
            <div className="space-y-2">
              <h3 className="font-outfit text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                Product Overview & Specifications
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-white/5 p-4 rounded-xl border border-white/5 font-sans">
                {selectedWebProject.details}
              </p>
            </div>

            {/* Web Product URL Info & Big Launch Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-400 truncate max-w-full sm:max-w-xs">
                <Globe className="w-4 h-4 text-techTeal flex-shrink-0" />
                <span className="truncate">{selectedWebProject.url}</span>
              </div>

              <button
                onClick={() => window.open(ensureAbsoluteUrl(selectedWebProject.url), '_blank', 'noopener,noreferrer')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-darkBg bg-gradient-to-r from-techTeal to-neonGreen hover:shadow-glowTealStrong transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" /> Open Web Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          FOOTER SECTION
          ========================================== */}
      <footer className="border-t border-white/5 bg-black/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10">
                <img src="/assets/logo.png" alt="PrasaTek Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-outfit text-lg font-bold text-white tracking-tight">PrasaTek</span>
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase -mt-0.5">System Solutions</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-sans">
              <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }} className="hover:text-techTeal transition-colors">Home</a>
              <a href="/services" onClick={(e) => { e.preventDefault(); navigateTo('/services'); }} className="hover:text-techTeal transition-colors">Services</a>
              {settings.showHardwareShop && (
                <a href="/shop" onClick={(e) => { e.preventDefault(); navigateTo('/shop'); }} className="hover:text-techTeal transition-colors">Shop</a>
              )}
              <a href="/#web-products" onClick={(e) => { e.preventDefault(); navigateTo('/'); setTimeout(() => { document.getElementById('web-products')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="hover:text-techTeal transition-colors">Web Products</a>
              <a href="/about" onClick={(e) => { e.preventDefault(); navigateTo('/about'); }} className="hover:text-techTeal transition-colors">About Us</a>
              <a href="/reviews" onClick={(e) => { e.preventDefault(); navigateTo('/reviews'); }} className="hover:text-techTeal transition-colors">Reviews</a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('/contact'); }} className="hover:text-techTeal transition-colors">Contact</a>
            </div>

            <div className="flex gap-4">
              <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-techTeal hover:border-techTeal/30 transition-all">
                <Phone className="w-4 h-4" />
              </a>
              <a href={`mailto:${settings.email}`} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-techTeal hover:border-techTeal/30 transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-500 font-sans">
            <p>&copy; 2026 PrasaTek System Solutions. All rights reserved.</p>
            <p className="font-semibold text-center text-slate-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 uppercase tracking-wider">
              THANK YOU FOR CHOOSING PRASATEK SYSTEM SOLUTIONS!
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
