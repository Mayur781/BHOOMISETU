// In-Memory Persistence Engine for BhoomiSetu
// Provides zero-config execution with complete schema & relational parity

class InMemoryStore {
  constructor() {
    this.users = [];
    this.projects = [];
    this.proposals = [];
    this.landParcels = [];
    this.notifications = [];
    this.awards = [];
    this.compensations = [];
    this.affectedFamilies = [];
    this.possessions = [];
    this.rrCases = [];
    this.documents = [];
    this.milestones = [];
    this.auditLogs = [];
    this.notificationAlerts = [];
    this.isInitialized = false;
  }

  generateId(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).substr(2, 8)}_${Date.now().toString(36)}`;
  }

  // --- Users ---
  findUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  }
  findUserById(id) {
    if (!id) return null;
    return this.users.find(u => (u._id && u._id === id) || (u.id && u.id === id));
  }
  getAllUsers() {
    return this.users.map(({ password, ...rest }) => rest);
  }
  createUser(userData) {
    const user = {
      _id: userData._id || this.generateId('usr'),
      id: userData.id || userData._id || this.generateId('usr'),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  // --- Projects ---
  getAllProjects(filters = {}) {
    let result = [...this.projects];
    if (filters.state) {
      result = result.filter(p => p.state === filters.state || (p.statesCovered && p.statesCovered.includes(filters.state)));
    }
    if (filters.projectType) {
      result = result.filter(p => p.projectType === filters.projectType || p.sector === filters.projectType);
    }
    if (filters.sector) {
      result = result.filter(p => p.projectType === filters.sector || p.sector === filters.sector);
    }
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters.currentStage) {
      result = result.filter(p => p.currentStage === filters.currentStage);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        (p.projectName && p.projectName.toLowerCase().includes(q)) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.projectId && p.projectId.toLowerCase().includes(q)) ||
        (p.projectCode && p.projectCode.toLowerCase().includes(q)) ||
        (p.implementingAgency && p.implementingAgency.toLowerCase().includes(q)) ||
        (p.district && p.district.toLowerCase().includes(q)) ||
        (p.state && p.state.toLowerCase().includes(q))
      );
    }
    return result;
  }

  findProjectById(id) {
    if (!id) return null;
    return this.projects.find(p => p._id === id || p.id === id || p.projectId === id || p.projectCode === id);
  }

  createProject(projectData) {
    const pId = projectData.projectId || projectData.projectCode || `PRJ-${Date.now().toString(36).toUpperCase()}`;
    const project = {
      _id: projectData._id || pId,
      id: projectData.id || projectData._id || pId,
      projectId: pId,
      projectCode: pId,
      projectName: projectData.projectName || projectData.title,
      title: projectData.projectName || projectData.title,
      projectType: projectData.projectType || projectData.sector || 'Highway',
      sector: projectData.projectType || projectData.sector || 'Highway',
      state: projectData.state || (projectData.statesCovered && projectData.statesCovered[0]) || 'Maharashtra',
      district: projectData.district || (projectData.districtsCovered && projectData.districtsCovered[0]) || 'Thane',
      tehsil: projectData.tehsil || (projectData.tehsilsCovered && projectData.tehsilsCovered[0]) || 'Bhiwandi',
      village: projectData.village || (projectData.villagesCovered && projectData.villagesCovered[0]) || 'Padgha',
      totalProjectArea: Number(projectData.totalProjectArea || projectData.requiredLandArea || projectData.targetAcquisitionAreaHectares || 100),
      requiredLandArea: Number(projectData.requiredLandArea || projectData.targetAcquisitionAreaHectares || 100),
      targetAcquisitionAreaHectares: Number(projectData.requiredLandArea || projectData.targetAcquisitionAreaHectares || 100),
      acquiredLandArea: Number(projectData.acquiredLandArea || projectData.acquiredAreaHectares || 0),
      acquiredAreaHectares: Number(projectData.acquiredLandArea || projectData.acquiredAreaHectares || 0),
      status: projectData.status || 'Active Acquisition',
      currentStage: projectData.currentStage || 'PROPOSAL_SUBMITTED',
      startDate: projectData.startDate || new Date(),
      expectedCompletionDate: projectData.expectedCompletionDate || new Date(Date.now() + 730 * 86400000),
      estimatedBudgetCrores: Number(projectData.estimatedBudgetCrores || projectData.estimatedCostInCrores || 250),
      compensationDisbursedCrores: Number(projectData.compensationDisbursedCrores || 0),
      khasraCount: 0,
      affectedFamiliesCount: 0,
      assignedOfficers: projectData.assignedOfficers || {
        calaOfficerName: 'Shri Suresh K. Patil',
        districtOfficerName: 'Shri Ashok Kumar Meena, IAS',
        surveyorOfficerName: 'Shri Santosh Yadav'
      },
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.push(project);
    return project;
  }

  updateProject(id, updateData) {
    const idx = this.projects.findIndex(p => p._id === id || p.id === id || p.projectId === id || p.projectCode === id);
    if (idx === -1) return null;
    this.projects[idx] = { ...this.projects[idx], ...updateData, updatedAt: new Date() };
    return this.projects[idx];
  }

  // --- Proposals ---
  getAllProposals(filters = {}) {
    let result = [...this.proposals];
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters.projectId) {
      result = result.filter(p => p.projectId === filters.projectId);
    }
    return result;
  }

  findProposalById(id) {
    if (!id) return null;
    return this.proposals.find(p => p._id === id || p.id === id || p.proposalId === id);
  }

  findProposalByProjectId(projectId) {
    if (!projectId) return null;
    return this.proposals.find(p => p.projectId === projectId);
  }

  createProposal(proposalData) {
    const propId = proposalData.proposalId || `PROP-${Date.now().toString(36).toUpperCase()}`;
    const proposal = {
      _id: proposalData._id || propId,
      id: proposalData.id || proposalData._id || propId,
      proposalId: propId,
      status: proposalData.status || 'Draft',
      statusHistory: [
        {
          fromStatus: 'None',
          toStatus: proposalData.status || 'Draft',
          updatedBy: proposalData.submittedBy?.name || 'Implementing Agency Officer',
          userRole: 'PROJECT_AGENCY_OFFICER',
          remarks: 'Draft proposal created in BhoomiSetu.',
          timestamp: new Date()
        }
      ],
      ...proposalData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.proposals.push(proposal);
    return proposal;
  }

  updateProposal(id, updateData) {
    const idx = this.proposals.findIndex(p => p._id === id || p.id === id || p.proposalId === id);
    if (idx === -1) return null;
    this.proposals[idx] = { ...this.proposals[idx], ...updateData, updatedAt: new Date() };
    return this.proposals[idx];
  }

  // --- Land Parcels ---
  getParcelsByProject(projectId) {
    return this.landParcels.filter(p => p.projectId === projectId || (p.projectId && (p.projectId._id === projectId || p.projectId.toString() === projectId)));
  }
  findParcelById(id) {
    return this.landParcels.find(p => p._id === id || p.id === id || p.parcelId === id);
  }
  createParcel(parcelData) {
    const parcelId = parcelData.parcelId || `PCL-${parcelData.state?.substring(0, 2).toUpperCase() || 'IN'}-${parcelData.district?.substring(0, 3).toUpperCase() || 'DIS'}-${Date.now().toString().slice(-4)}`;
    const parcel = {
      _id: parcelData._id || this.generateId('pcl'),
      id: parcelData.id || parcelData._id || this.generateId('pcl'),
      parcelId,
      surveyNumber: parcelData.surveyNumber || parcelData.khasraNumber || '1/1',
      khasraNumber: parcelData.khasraNumber || parcelData.surveyNumber || '1/1',
      area: Number(parcelData.area || parcelData.acquiredAreaHectares || parcelData.totalAreaHectares || 1.0),
      ...parcelData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.landParcels.push(parcel);
    const proj = this.findProjectById(parcel.projectId);
    if (proj) {
      proj.khasraCount = (proj.khasraCount || 0) + 1;
    }
    return parcel;
  }
  updateParcel(id, updateData) {
    const idx = this.landParcels.findIndex(p => p._id === id || p.id === id || p.parcelId === id);
    if (idx === -1) return null;
    this.landParcels[idx] = { ...this.landParcels[idx], ...updateData, updatedAt: new Date() };
    return this.landParcels[idx];
  }

  // --- GIS Module Engine ---
  normalizeParcelStatus(status) {
    if (!status) return 'Proposed';
    if (status === 'SIA Survey Complete' || status === 'Under Verification') return 'Under Verification';
    if (status === 'Sec 11 Notified' || status === 'Notification Issued') return 'Notification Issued';
    if (status === 'Award Determined' || status === 'Awarded') return 'Awarded';
    if (status === 'Disbursed' || status === 'Compensation Paid') return 'Compensation Paid';
    if (status === 'Possession Transferred' || status === 'Possession Taken') return 'Possession Taken';
    if (status === 'R&R Pending') return 'R&R Pending';
    if (status === 'Completed') return 'Completed';
    return status;
  }

  formatGisParcel(parcel) {
    const proj = this.findProjectById(parcel.projectId);
    const normStatus = this.normalizeParcelStatus(parcel.acquisitionStatus);
    const surveyNumber = parcel.surveyNumber || parcel.khasraNumber || 'N/A';
    const area = Number(parcel.area || parcel.acquiredAreaHectares || parcel.totalAreaHectares || 1.0);
    const lat = parcel.latitude || parcel.gisAttributes?.centroid?.lat || (parcel.geometry?.coordinates?.[0]?.[0]?.[1]) || 20.5937;
    const lng = parcel.longitude || parcel.gisAttributes?.centroid?.lng || (parcel.geometry?.coordinates?.[0]?.[0]?.[0]) || 78.9629;
    
    // Status color mapping for Leaflet
    let statusColor = '#3b82f6'; // Proposed - Blue
    if (normStatus === 'Under Verification') statusColor = '#06b6d4'; // Cyan
    else if (normStatus === 'Notification Issued') statusColor = '#8b5cf6'; // Purple
    else if (normStatus === 'Awarded') statusColor = '#f59e0b'; // Amber
    else if (normStatus === 'Compensation Paid') statusColor = '#14b8a6'; // Teal
    else if (normStatus === 'Possession Taken') statusColor = '#10b981'; // Emerald
    else if (normStatus === 'R&R Pending') statusColor = '#f97316'; // Orange
    else if (normStatus === 'Completed') statusColor = '#047857'; // Dark Emerald

    return {
      _id: parcel._id || parcel.id,
      id: parcel._id || parcel.id,
      parcelId: parcel.parcelId || `PCL-${parcel.state?.substring(0, 2).toUpperCase() || 'IN'}-${parcel.district?.substring(0, 3).toUpperCase() || 'DIS'}-${parcel._id?.slice(-4) || '001'}`,
      surveyNumber,
      khasraNumber: surveyNumber,
      village: parcel.village,
      tehsil: parcel.tehsil || 'Central',
      district: parcel.district,
      state: parcel.state,
      area,
      totalAreaHectares: Number(parcel.totalAreaHectares || area),
      acquiredAreaHectares: area,
      landCategory: parcel.landCategory || 'Private Agricultural (Irrigated)',
      circleRatePerHectare: parcel.circleRatePerHectare || 3500000,
      marketValuePerHectare: parcel.marketValuePerHectare || 4200000,
      acquisitionStatus: normStatus,
      statusColor,
      project: {
        id: proj?.projectId || proj?._id || parcel.projectId,
        name: proj?.projectName || proj?.title || 'National Infrastructure Corridor',
        type: proj?.projectType || proj?.sector || 'Highway',
        ministry: proj?.ministry || 'Ministry of Infrastructure'
      },
      latitude: lat,
      longitude: lng,
      geometry: parcel.geometry || {
        type: 'Polygon',
        coordinates: [
          [
            [lng - 0.001, lat - 0.001],
            [lng + 0.001, lat - 0.001],
            [lng + 0.001, lat + 0.001],
            [lng - 0.001, lat + 0.001],
            [lng - 0.001, lat - 0.001]
          ]
        ]
      },
      owners: parcel.owners || [],
      affectedFamilyReference: parcel.affectedFamilyReference || (parcel.owners?.[0] ? {
        familyId: `PAF-${parcel.district?.substring(0, 3).toUpperCase()}-001`,
        familyHeadName: parcel.owners[0].name,
        vulnerabilityCategory: 'General / Small Farmer',
        aadhaarMasked: parcel.owners[0].aadhaarMasked || 'XXXX-XXXX-4589'
      } : null),
      compensation: parcel.compensation || {
        amount: Math.round(area * (parcel.marketValuePerHectare || 4200000) * 2.12),
        status: ['Compensation Paid', 'Possession Taken', 'Completed'].includes(normStatus) ? 'Paid' : (normStatus === 'Awarded' ? 'Assessed' : 'Pending'),
        disbursedDate: ['Compensation Paid', 'Possession Taken', 'Completed'].includes(normStatus) ? new Date('2024-03-15') : null,
        utrNumber: ['Compensation Paid', 'Possession Taken', 'Completed'].includes(normStatus) ? `PFMS-DBT-${Date.now().toString().slice(-8)}` : null
      },
      possession: parcel.possession || {
        status: ['Possession Taken', 'Completed'].includes(normStatus) ? 'Possession Taken' : 'Not Taken',
        certificateNumber: ['Possession Taken', 'Completed'].includes(normStatus) ? `FORM-11-${parcel.district?.substring(0, 3).toUpperCase()}-2024` : null,
        possessionDate: ['Possession Taken', 'Completed'].includes(normStatus) ? new Date('2024-04-10') : null
      },
      rrStatus: parcel.rrStatus || {
        status: normStatus === 'Completed' ? 'Settled' : (normStatus === 'R&R Pending' ? 'Pending Allotment' : 'Not Applicable'),
        schemeName: 'RFCTLARR Second Schedule Resettlement Scheme',
        houseAllotted: normStatus === 'Completed',
        subsistenceGrantPaid: ['Compensation Paid', 'Possession Taken', 'Completed'].includes(normStatus)
      },
      gisAttributes: parcel.gisAttributes || {
        centroid: { lat, lng },
        treesCount: 5,
        structuresCount: 1,
        jointMeasurementSurveyDone: true
      }
    };
  }

  getGisParcels(filters = {}) {
    let result = this.landParcels.map(p => this.formatGisParcel(p));

    if (filters.state && filters.state !== 'ALL') {
      result = result.filter(p => p.state.toLowerCase() === filters.state.toLowerCase());
    }
    if (filters.district && filters.district !== 'ALL') {
      result = result.filter(p => p.district.toLowerCase() === filters.district.toLowerCase());
    }
    if (filters.projectId && filters.projectId !== 'ALL') {
      result = result.filter(p => p.project.id === filters.projectId || p.project.id?.toLowerCase() === filters.projectId?.toLowerCase());
    }
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(p => p.acquisitionStatus.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.parcelId.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.project.name.toLowerCase().includes(q) ||
        p.owners?.some(o => o.name.toLowerCase().includes(q))
      );
    }
    return result;
  }

  findGisParcelById(id) {
    if (!id) return null;
    const p = this.landParcels.find(x => {
      if (x._id === id || x.id === id || x.parcelId === id || x.khasraNumber === id || x.surveyNumber === id) return true;
      const formatted = this.formatGisParcel(x);
      return formatted.parcelId === id;
    });
    return p ? this.formatGisParcel(p) : null;
  }

  getGisStatistics(filters = {}) {
    const parcels = this.getGisParcels(filters);
    const totalParcels = parcels.length;
    const proposed = parcels.filter(p => p.acquisitionStatus === 'Proposed').length;
    const underVerification = parcels.filter(p => p.acquisitionStatus === 'Under Verification').length;
    const notificationIssued = parcels.filter(p => p.acquisitionStatus === 'Notification Issued').length;
    const awarded = parcels.filter(p => p.acquisitionStatus === 'Awarded').length;
    const compensationPaid = parcels.filter(p => p.acquisitionStatus === 'Compensation Paid').length;
    const possessionTaken = parcels.filter(p => p.acquisitionStatus === 'Possession Taken').length;
    const rrPending = parcels.filter(p => p.acquisitionStatus === 'R&R Pending').length;
    const completed = parcels.filter(p => p.acquisitionStatus === 'Completed').length;

    const acquired = possessionTaken + completed;
    const compensationCompleted = compensationPaid + possessionTaken + completed;
    const possessionCompleted = acquired;
    const totalAreaHectares = parcels.reduce((sum, p) => sum + (Number(p.area) || 0), 0);

    return {
      totalParcels,
      proposed,
      underVerification,
      notificationIssued,
      awarded,
      compensationPaid,
      possessionTaken,
      rrPending,
      completed,
      acquired,
      compensationCompleted,
      possessionCompleted,
      totalAreaHectares: Number(totalAreaHectares.toFixed(2))
    };
  }

  getGisMapData(filters = {}) {
    const formattedParcels = this.getGisParcels(filters);

    // Build GeoJSON FeatureCollection
    const features = formattedParcels.map(parcel => ({
      type: 'Feature',
      id: parcel.id,
      properties: {
        parcelId: parcel.parcelId,
        surveyNumber: parcel.surveyNumber,
        khasraNumber: parcel.surveyNumber,
        area: parcel.area,
        project: parcel.project,
        village: parcel.village,
        tehsil: parcel.tehsil,
        district: parcel.district,
        state: parcel.state,
        acquisitionStatus: parcel.acquisitionStatus,
        statusColor: parcel.statusColor,
        compensation: parcel.compensation,
        possession: parcel.possession,
        rrStatus: parcel.rrStatus,
        owners: parcel.owners,
        affectedFamilyReference: parcel.affectedFamilyReference,
        latitude: parcel.latitude,
        longitude: parcel.longitude
      },
      geometry: parcel.geometry
    }));

    // Filter projects matching state or selection
    let filteredProjects = [...this.projects];
    if (filters.state && filters.state !== 'ALL') {
      filteredProjects = filteredProjects.filter(p => p.state.toLowerCase() === filters.state.toLowerCase());
    }
    if (filters.projectId && filters.projectId !== 'ALL') {
      filteredProjects = filteredProjects.filter(p => p.projectId === filters.projectId || p._id === filters.projectId || p.id === filters.projectId);
    }

    const projectMarkers = filteredProjects.map(p => {
      const stateCoordsMap = {
        'Maharashtra': { lat: 19.345, lng: 73.125 },
        'Gujarat': { lat: 21.082, lng: 72.882 },
        'Uttar Pradesh': { lat: 25.562, lng: 81.822 },
        'Tamil Nadu': { lat: 13.312, lng: 80.322 },
        'Karnataka': { lat: 16.322, lng: 75.482 },
        'Andhra Pradesh': { lat: 15.683, lng: 78.213 },
        'Odisha': { lat: 21.452, lng: 87.012 },
        'Bihar': { lat: 25.591, lng: 85.121 },
        'Rajasthan': { lat: 26.655, lng: 71.185 },
        'Madhya Pradesh': { lat: 24.625, lng: 79.825 },
        'Haryana': { lat: 28.4595, lng: 77.0266 },
        'Delhi': { lat: 28.6139, lng: 77.209 },
        'Telangana': { lat: 17.385, lng: 78.4867 },
        'West Bengal': { lat: 22.5726, lng: 88.3639 }
      };
      const coords = stateCoordsMap[p.state] || { lat: 20.5937, lng: 78.9629 };
      const latitude = p.location?.latitude || p.gisAnchor?.latitude || coords.lat;
      const longitude = p.location?.longitude || p.gisAnchor?.longitude || coords.lng;

      return {
        projectId: p.projectId || p._id,
        projectName: p.projectName || p.title,
        projectType: p.projectType || p.sector || 'Highway',
        ministry: p.ministry,
        implementingAgency: p.implementingAgency,
        state: p.state,
        district: p.district,
        totalProjectArea: p.totalProjectArea || p.requiredLandArea || 100,
        requiredLandArea: p.requiredLandArea || 100,
        acquiredLandArea: p.acquiredLandArea || 0,
        status: p.status,
        currentStage: p.currentStage,
        latitude,
        longitude,
        estimatedBudgetCrores: p.estimatedBudgetCrores || 250
      };
    });

    const statistics = this.getGisStatistics(filters);

    return {
      success: true,
      statistics,
      projectMarkers,
      parcels: {
        type: 'FeatureCollection',
        totalFeatures: features.length,
        features
      },
      totalParcels: formattedParcels.length,
      disclaimer: 'DISCLAIMER: Demo coordinates and spatial polygons displayed are simulated spatial representations under PM GatiShakti framework and do NOT constitute certified legal cadastral boundaries under State Land Records Acts.'
    };
  }

  // --- Notifications ---
  getNotificationsByProject(projectId) {
    return this.notifications.filter(n => n.projectId === projectId);
  }
  findNotificationById(id) {
    return this.notifications.find(n => n._id === id || n.id === id || n.notificationNumber === id);
  }
  createNotification(notifData) {
    const notif = {
      _id: notifData._id || this.generateId('notif'),
      id: notifData.id || notifData._id || this.generateId('notif'),
      ...notifData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.notifications.push(notif);
    return notif;
  }

  // --- Awards ---
  getAwardsByProject(projectId) {
    return this.awards.filter(a => a.projectId === projectId);
  }
  findAwardById(id) {
    return this.awards.find(a => a._id === id || a.id === id || a.awardNumber === id);
  }
  createAward(awardData) {
    const award = {
      _id: awardData._id || this.generateId('awd'),
      id: awardData.id || awardData._id || this.generateId('awd'),
      ...awardData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.awards.push(award);
    return award;
  }

  // --- Compensations ---
  getCompensationsByProject(projectId) {
    return this.compensations.filter(c => c.projectId === projectId);
  }
  findCompensationById(id) {
    return this.compensations.find(c => c._id === id || c.id === id || c.compensationId === id);
  }
  createCompensation(compData) {
    const comp = {
      _id: compData._id || this.generateId('cmp'),
      id: compData.id || compData._id || this.generateId('cmp'),
      ...compData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.compensations.push(comp);
    return comp;
  }
  updateCompensation(id, updateData) {
    const idx = this.compensations.findIndex(c => c._id === id || c.id === id || c.compensationId === id);
    if (idx === -1) return null;
    this.compensations[idx] = { ...this.compensations[idx], ...updateData, updatedAt: new Date() };
    return this.compensations[idx];
  }

  // --- Affected Families (PAFs) ---
  getFamiliesByProject(projectId) {
    return this.affectedFamilies.filter(f => f.projectId === projectId);
  }
  findFamilyById(id) {
    return this.affectedFamilies.find(f => f._id === id || f.id === id || f.familyRegistrationId === id);
  }
  createFamily(familyData) {
    const family = {
      _id: familyData._id || this.generateId('fam'),
      id: familyData.id || familyData._id || this.generateId('fam'),
      ...familyData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.affectedFamilies.push(family);
    const proj = this.findProjectById(family.projectId);
    if (proj) {
      proj.affectedFamiliesCount = (proj.affectedFamiliesCount || 0) + 1;
    }
    return family;
  }

  // --- Possessions ---
  getPossessionsByProject(projectId) {
    return this.possessions.filter(p => p.projectId === projectId);
  }
  createPossession(posData) {
    const pos = {
      _id: posData._id || this.generateId('pos'),
      id: posData.id || posData._id || this.generateId('pos'),
      ...posData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.possessions.push(pos);
    return pos;
  }

  // --- R&R Cases ---
  getRRByProject(projectId) {
    return this.rrCases.filter(r => r.projectId === projectId);
  }
  createRRCase(rrData) {
    const rrc = {
      _id: rrData._id || this.generateId('rrc'),
      id: rrData.id || rrData._id || this.generateId('rrc'),
      ...rrData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.rrCases.push(rrc);
    return rrc;
  }

  // --- Documents ---
  getDocumentsByProject(projectId) {
    return this.documents.filter(d => d.projectId === projectId);
  }
  createDocument(docData) {
    const doc = {
      _id: docData._id || this.generateId('doc'),
      id: docData.id || docData._id || this.generateId('doc'),
      ...docData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.push(doc);
    return doc;
  }

  // --- Milestones ---
  getMilestonesByProject(projectId) {
    return this.milestones.filter(m => m.projectId === projectId);
  }
  createMilestone(mileData) {
    const milestone = {
      _id: mileData._id || this.generateId('mls'),
      id: mileData.id || mileData._id || this.generateId('mls'),
      ...mileData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.milestones.push(milestone);
    return milestone;
  }

  // --- Audit Logs ---
  addAuditLog(logData) {
    const log = {
      _id: this.generateId('aud'),
      timestamp: new Date(),
      ...logData
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 1000) {
      this.auditLogs.pop();
    }
    return log;
  }

  getAuditLogsByProject(projectId, limit = 100) {
    return this.auditLogs.filter(l => l.resourceId === projectId || l.metadata?.projectId === projectId).slice(0, limit);
  }

  getAuditLogs(limit = 100) {
    return this.auditLogs.slice(0, limit);
  }

  // --- Notification Alerts ---
  addAlert(alertData) {
    const alert = {
      _id: this.generateId('alt'),
      alertId: this.generateId('alt'),
      isRead: false,
      createdAt: new Date(),
      ...alertData
    };
    this.notificationAlerts.unshift(alert);
    return alert;
  }

  getAlertsForRole(role) {
    return this.notificationAlerts.filter(a => a.recipientRole === role || a.recipientRole === 'ALL');
  }

  // --- Master Relational Aggregator for 12-Tab Project Details View ---
  getProjectAggregate(id) {
    const project = this.findProjectById(id);
    if (!project) return null;

    const projectId = project.projectId || project.projectCode || project._id || project.id;
    const internalId = project._id || project.id;

    // Filter related records matching either the projectId string or Mongo internal id
    const matchProj = (item) => item.projectId === projectId || item.projectId === internalId;

    const proposal = this.proposals.find(p => matchProj(p)) || null;
    const landParcels = this.landParcels.filter(p => matchProj(p));
    const notifications = this.notifications.filter(n => matchProj(n));
    const awards = this.awards.filter(a => matchProj(a));
    const compensations = this.compensations.filter(c => matchProj(c));
    const affectedFamilies = this.affectedFamilies.filter(f => matchProj(f));
    const possessions = this.possessions.filter(p => matchProj(p));
    const rrCases = this.rrCases.filter(r => matchProj(r));
    const documents = this.documents.filter(d => matchProj(d));
    const milestones = this.milestones.filter(m => matchProj(m));
    const auditLogs = this.auditLogs.filter(l => l.resourceId === projectId || l.resourceId === internalId || l.metadata?.projectId === projectId);

    const totalCompensationSanctioned = compensations.reduce((sum, c) => sum + (c.totalCompensationPayable || 0), 0);
    const totalCompensationDisbursed = compensations
      .filter(c => c.paymentStatus === 'DBT Disbursed')
      .reduce((sum, c) => sum + (c.totalCompensationPayable || 0), 0);

    return {
      project,
      proposal,
      landParcels,
      notifications,
      awards,
      compensations,
      affectedFamilies,
      possessions,
      rrCases,
      documents,
      milestones,
      auditLogs,
      stats: {
        totalParcels: landParcels.length,
        totalNotifications: notifications.length,
        totalAwards: awards.length,
        totalCompensations: compensations.length,
        totalFamilies: affectedFamilies.length,
        totalPossessions: possessions.length,
        totalRRCases: rrCases.length,
        totalDocuments: documents.length,
        totalMilestones: milestones.length,
        totalCompensationSanctioned,
        totalCompensationDisbursed
      }
    };
  }
}

const memoryStore = new InMemoryStore();
module.exports = memoryStore;
