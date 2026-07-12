// SmolLyfe v1.06.0 - Critical Bug Fixes & UI Standardization
// Main orchestrator - handles state and routing only
// 11.13.2025 - Visibility gating, UI consistency, apply job wiring

import React, { useState, useEffect } from "react";
import { Text, View, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";

// Core
import { createNewLife, ageUpLife } from "./core/gameState.js";

// Domains
import { handleActivity } from "./domains/activities.js";
import { handleInteraction } from "./domains/relationships.js";
import { handleStudyHarder, handleSlackOff, generateFreelanceGig, acceptFreelanceGig, calculatePopularity } from "./domains/occupation.js";
import { generateTryout, attemptTryout, practiceActivity, dropActivity, generateTeammates } from "./domains/extracurricular.js";
// 11.11.2025 - Phase 2.1: Added part-time jobs domain
import { applyForJob, workShift, quitJob } from "./domains/partTimeJobs.js";
// 11.11.2025 - Added activity action handler
import { handleActivityAction } from "./domains/extracurricular.js";
// 11.11.2025 - University system
import { applyForScholarship, payTuitionSelf, payTuitionParents, takeStudentLoan, skipUniversity } from "./domains/university.js";
import { getGradePercent, progressSchoolYear } from "./domains/schoolProgress.js";
import { shouldOfferDrivingTest, skipDrivingTest, takeDrivingTest } from "./domains/driving.js";

// Components
import CharCreationModal from "./components/modals/CharCreationModal.js";
import InteractionModal from "./components/modals/InteractionModal.js";
import FreelanceGigModal from "./components/modals/FreelanceGigModal.js";
import SettingsModal from "./components/modals/SettingsModal.js";
import AllLivesModal from "./components/modals/AllLivesModal.js";
import ExtracurricularOfferModal from "./components/modals/ExtracurricularOfferModal.js";
import SportSelectionModal from "./components/modals/SportSelectionModal.js";
import TryoutModal from "./components/modals/TryoutModal.js";
import DrivingTestModal from "./components/modals/DrivingTestModal.js";
// 11.11.2025 - University modal
import UniversityOptionsModal from "./components/modals/UniversityOptionsModal.js";
// 11.11.2025 - Clique Browser Modal
import CliqueBrowserModal from "./components/modals/CliqueBrowserModal.js";
// 11.11.2025 - v1.01.0: Befriend Result Modal
import BefriendResultModal from "./components/modals/BefriendResultModal.js";
// 11.13.2025 - v1.06.0: Job Application Result Modal
import JobApplicationResultModal from "./components/modals/JobApplicationResultModal.js";
// 11.15.2025 - v1.07.0: Pregnancy Modal
import PregnancyModal from "./components/modals/PregnancyModal.js";
// 11.19.2025 - Greek Life Modal
import GreekLifeModal from "./components/modals/GreekLifeModal.js";
// 11.19.2025 - College Recruitment Modal
import CollegeRecruitmentModal from "./components/modals/CollegeRecruitmentModal.js";
import ActionResultModal from "./components/modals/ActionResultModal.js";
import NpcPromptModal from "./components/modals/NpcPromptModal.js";
import ActivitiesPanel from "./components/panels/ActivitiesPanel.js";
import AssetsPanel from "./components/panels/AssetsPanel.js";
import OccupationPanel from "./components/panels/OccupationPanel.js";
import SchoolPanel from "./components/panels/SchoolPanel.js";
import ExtracurricularDetailPanel from "./components/panels/ExtracurricularDetailPanel.js";
import RelationshipsPanel from "./components/panels/RelationshipsPanel.js";
// 11.11.2025 - Phase 2.1: Added PartTimeJobsPanel component
import PartTimeJobsPanel from "./components/panels/PartTimeJobsPanel.js";
// 11.11.2025 - Phase 3: Full-time jobs, special careers, detective cases
import FullTimeJobsPanel from "./components/panels/FullTimeJobsPanel.js";
import SpecialCareersPanel from "./components/panels/SpecialCareersPanel.js";
import DetectiveCasePanel from "./components/panels/DetectiveCasePanel.js";
// 11.11.2025 - v1.02.0: Phase 5A - Coworker Panel
import CoworkerPanel from "./components/panels/CoworkerPanel.js";
import MilestoneBanner from "./components/layout/MilestoneBanner.js";
import HistoryLog from "./components/layout/HistoryLog.js";
import NavigationTabs from "./components/layout/NavigationTabs.js";
import StatusBars from "./components/layout/StatusBars.js";
import RouteIdentityStrip from "./components/layout/RouteIdentityStrip.js";
import LifeFeed from "./components/feed/LifeFeed.js";
import ProfileHub from "./components/feed/ProfileHub.js";
import TimelineArchive from "./components/feed/TimelineArchive.js";

// Utils
import { saveLifeToStorage, loadLivesFromStorage, deleteLifeFromStorage } from "./utils/storage.js";
import { buildLifeFeed, canAccessRoute } from "./utils/feed.js";
import { generateNpcPrompt, resolveNpcPrompt } from "./domains/npcPrompts.js";

// Styles
import { styles } from "./styles/AppStyles.js";

export default function App() {
  const [life, setLife] = useState(null);
  const [allLives, setAllLives] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [showCharCreation, setShowCharCreation] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showFreelanceGigModal, setShowFreelanceGigModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAllLivesModal, setShowAllLivesModal] = useState(false);
  const [showSchoolPanel, setShowSchoolPanel] = useState(false);
  const [showActivityDetailPanel, setShowActivityDetailPanel] = useState(false);
  // 11.11.2025 - Phase 2.1: Added part-time jobs panel state
  const [showPartTimeJobsPanel, setShowPartTimeJobsPanel] = useState(false);
  // 11.11.2025 - Phase 3: Career panels state
  const [showFullTimeJobsPanel, setShowFullTimeJobsPanel] = useState(false);
  const [showSpecialCareersPanel, setShowSpecialCareersPanel] = useState(false);
  const [showDetectiveCasePanel, setShowDetectiveCasePanel] = useState(false);
  // 11.11.2025 - v1.02.0: Phase 5A - Coworker panel state
  const [showCoworkerPanel, setShowCoworkerPanel] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [showExtracurricularOffer, setShowExtracurricularOffer] = useState(false);
  const [showSportSelectionModal, setShowSportSelectionModal] = useState(false);
  const [showTryoutModal, setShowTryoutModal] = useState(false);
  // 11.11.2025 - Clique browser modal state
  const [showCliqueBrowserModal, setShowCliqueBrowserModal] = useState(false);
  // 11.11.2025 - v1.01.0: Befriend result modal state
  const [showBefriendResultModal, setShowBefriendResultModal] = useState(false);
  const [befriendResult, setBefriendResult] = useState(null);
  const [showActionResultModal, setShowActionResultModal] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [milestoneBanner, setMilestoneBanner] = useState(null);
  const [showNpcPromptModal, setShowNpcPromptModal] = useState(false);
  const [currentNpcPrompt, setCurrentNpcPrompt] = useState(null);
  // 11.13.2025 - v1.06.0: Job application result modal state
  const [showJobApplicationModal, setShowJobApplicationModal] = useState(false);
  const [jobApplicationResult, setJobApplicationResult] = useState(null);
  // 11.13.2025 - v1.07.0: University modal attempts tracking
  const [universityAttempts, setUniversityAttempts] = useState({});
  // 11.15.2025 - v1.07.0: Pregnancy modal state
  const [showPregnancyModal, setShowPregnancyModal] = useState(false);
  // 11.19.2025 - Greek life modal state
  const [showGreekLifeModal, setShowGreekLifeModal] = useState(false);
  // 11.19.2025 - College recruitment modal state
  const [showCollegeRecruitmentModal, setShowCollegeRecruitmentModal] = useState(false);
  const [showDrivingTestModal, setShowDrivingTestModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [currentGig, setCurrentGig] = useState(null);
  const [currentTryout, setCurrentTryout] = useState(null);
  const [returnView, setReturnView] = useState(null);
  const [selectedTimelineAge, setSelectedTimelineAge] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [routeFocusTarget, setRouteFocusTarget] = useState(null);

  // Load lives on mount
  useEffect(() => {
    let mounted = true;
    loadLivesFromStorage().then((saved) => {
      if (mounted) {
        setAllLives(saved);
      }
    }).catch((error) => {
      console.error("Failed to initialize saved lives:", error);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!milestoneBanner) return undefined;

    const timer = setTimeout(() => {
      setMilestoneBanner(null);
    }, 3200);

    return () => clearTimeout(timer);
  }, [milestoneBanner]);

  function resetOccupationPanels() {
    setShowSchoolPanel(false);
    setShowActivityDetailPanel(false);
    setShowPartTimeJobsPanel(false);
    setShowFullTimeJobsPanel(false);
    setShowSpecialCareersPanel(false);
    setShowDetectiveCasePanel(false);
    setShowCoworkerPanel(false);
  }

  function saveAndSetLife(updatedLife) {
    const updatedLives = saveLifeToStorage(updatedLife, allLives);
    setAllLives(updatedLives);
    setLife(updatedLife);
    return updatedLife;
  }

  function showResultPayload(result) {
    if (!result) return;
    setActionResult(result);
    setShowActionResultModal(true);
  }

  function revealPendingQueuedModal(currentLife = life) {
    if (currentLife?.showPregnancyModal) {
      setShowPregnancyModal(true);
      return true;
    }
    if (currentLife?.showCollegeRecruitmentModal) {
      setShowCollegeRecruitmentModal(true);
      return true;
    }
    return false;
  }

  function maybeTriggerNpcPrompt(updatedLife) {
    if (!updatedLife || Number(updatedLife.age || 0) < 12 || Math.random() > 0.18) return;
    const prompt = generateNpcPrompt(updatedLife);
    if (!prompt) return;
    setCurrentNpcPrompt(prompt);
    setShowNpcPromptModal(true);
  }

  function getAgeMilestone(age, currentLife) {
    const name = currentLife?.firstName || "This life";
    if (age === 5) {
      return {
        eyebrow: "Milestone",
        title: `${name} has turned 5!`,
      };
    }
    if (age === 10) {
      return {
        eyebrow: "Milestone",
        title: `${name} has turned 10!`,
      };
    }
    if (age === 13) {
      return {
        eyebrow: "Milestone",
        title: `${name} has become a teenager!`,
      };
    }
    if (age === 18) {
      return {
        eyebrow: "Milestone",
        title: `${name} has become an adult!`,
      };
    }
    return null;
  }

  // 11.11.2025 - v1.03.0: Reset all panel states when tab changes
  function handleTabChange(newTab, focusTarget = null) {
    if (life && !canAccessRoute(life, newTab)) {
      setActiveTab("home");
      return;
    }
    if (newTab === "settings") {
      setShowSettingsModal(true);
      return;
    }
    if (newTab !== activeTab) {
      setNavigationHistory((current) => [...current, activeTab]);
    }
    setRouteFocusTarget(focusTarget);
    setActiveTab(newTab);
    resetOccupationPanels();
  }

  function handleBackNavigation() {
    if (activeTab === "occupation") {
      if (showCoworkerPanel) {
        setShowCoworkerPanel(false);
        return;
      }
      if (showDetectiveCasePanel) {
        setShowDetectiveCasePanel(false);
        return;
      }
      if (showSpecialCareersPanel) {
        setShowSpecialCareersPanel(false);
        return;
      }
      if (showFullTimeJobsPanel) {
        setShowFullTimeJobsPanel(false);
        return;
      }
      if (showPartTimeJobsPanel) {
        setShowPartTimeJobsPanel(false);
        return;
      }
      if (showActivityDetailPanel) {
        setShowActivityDetailPanel(false);
        setCurrentActivity(null);
        return;
      }
      if (showSchoolPanel) {
        setShowSchoolPanel(false);
        return;
      }
    }

    setNavigationHistory((current) => {
      if (current.length === 0) {
        setRouteFocusTarget(null);
        setActiveTab("home");
        resetOccupationPanels();
        return current;
      }

      const next = [...current];
      const previousTab = next.pop() || "home";
      setRouteFocusTarget(null);
      setActiveTab(previousTab);
      resetOccupationPanels();
      return next;
    });
  }

  // ========== HANDLERS ==========
  function handleCreateCharacter(formData) {
    const newLife = createNewLife(formData);
    const updatedLives = saveLifeToStorage(newLife, allLives);
    setAllLives(updatedLives);
    setLife(newLife);
    setShowCharCreation(false);
    setActiveTab("home");
    setNavigationHistory([]);
  }

  function handleOpenTimeline(age = null) {
    setSelectedTimelineAge(age);
    handleTabChange("timeline");
  }

  function handleAgeUp() {
    let updated = ageUpLife(life); // 11.11.2025 - v1.05.0: Changed to 'let' for reassignments
    let ageUpActionResult = null;
    let shouldShowExtracurricularOffer = false;
    let shouldShowDrivingTest = false;

    // Show extracurricular offer at age 12 for first time
    if (updated.age === 12 && !updated.hasSeenExtracurricularOffer) {
      updated.hasSeenExtracurricularOffer = true;
      shouldShowExtracurricularOffer = true;
    }

    // 11.11.2025 - Show University options modal at age 18 (graduation)
    if (updated.age === 18 && updated.showUniversityOptions) {
      saveAndSetLife(updated);
      const milestone = getAgeMilestone(updated.age, updated);
      if (milestone) {
        setMilestoneBanner(milestone);
      } else if (activeTab !== "home") {
        setMilestoneBanner({
          eyebrow: "Year advanced",
          title: `${updated.firstName} has turned ${updated.age}!`,
        });
      }
      return; // Don't clear the flag yet, modal will handle it
    }

    // 11.11.2025 - v1.00.10: Phase 3 - Process monthly income from full-time jobs
    if (updated.fullTimeJob) {
      const monthlyIncome = Math.floor(updated.fullTimeJob.salary / 12);
      updated.money += monthlyIncome;
      updated.history.unshift(`💰 Earned $${monthlyIncome.toLocaleString()} from ${updated.fullTimeJob.title}`);
    }

    // 11.11.2025 - v1.00.10: Phase 3 - Process monthly income from special careers
    if (updated.specialCareer) {
      const monthlyIncome = Math.floor(updated.specialCareer.salary / 12);
      updated.money += monthlyIncome;
      updated.history.unshift(`💰 Earned $${monthlyIncome.toLocaleString()} from ${updated.specialCareer.title}`);
    }

    // 11.11.2025 - v1.00.10: Phase 3 - Progress detective cases
    if (updated.activeCase) {
      const { progressCase } = require("./domains/detectiveCases.js");
      const caseResult = progressCase(updated);
      Object.assign(updated, caseResult);
    }

    // 11.11.2025 - v1.02.0: Process coworker events
    if (updated.fullTimeJob?.coworkers) {
      const { processCoworkerEvents } = require("./domains/coworkers.js");
      const { checkWorkplaceEvents } = require("./domains/events/workplaceEvents.js");
      updated = processCoworkerEvents(updated);
      updated = checkWorkplaceEvents(updated);
    }

    // 11.11.2025 - v1.05.0: Process clique/alumni network events
    try {
      const { checkCliqueEvents } = require("./domains/events/cliqueEvents.js");
      const cliqueResult = checkCliqueEvents(updated);
      if (cliqueResult) updated = cliqueResult;
    } catch (error) {
      console.error("Clique events error:", error);
    }

    // 11.11.2025 - v1.05.0: Apply network influence bonuses
    try {
      const { applyNetworkInfluence } = require("./domains/cliques.js");
      const networkResult = applyNetworkInfluence(updated);
      if (networkResult) updated = networkResult;
    } catch (error) {
      console.error("Network influence error:", error);
    }

    // 11.13.2025 - v1.06.0: University progression
    if (updated.occupation && updated.occupation.includes("University Student")) {
      const { progressUniversity } = require("./domains/university.js");
      updated = progressUniversity(updated);
    }

    if (updated.age >= 5 && updated.age < 18) {
      const schoolProgress = progressSchoolYear(updated);
      updated = schoolProgress.updated;
      if (schoolProgress.actionResult) {
        ageUpActionResult = schoolProgress.actionResult;
      }
    }

    if (shouldOfferDrivingTest(updated)) {
      if (!updated.promptState) updated.promptState = {};
      updated.promptState.drivingTestOffered = true;
      shouldShowDrivingTest = true;
    }

    // 11.19.2025 - Greek life dues payment
    if (updated.greekLife) {
      const { payGreekLifeDues } = require("./domains/cliques.js");
      updated = payGreekLifeDues(updated);
    }

    // 11.19.2025 - College athlete season progression
    if (updated.collegeAthlete) {
      const { progressCollegeSeason } = require("./domains/collegeAthletics.js");
      updated = progressCollegeSeason(updated);
    }

    // 11.19.2025 - HS athletic rankings (Jr/Sr year)
    if ((updated.age === 17 || updated.age === 18) && !updated.hsAthletics?.ranking) {
      const { assignHSRanking } = require("./domains/collegeAthletics.js");
      const basketballExp = updated.extracurricularDetails?.basketball?.experience || 0;
      const footballExp = updated.extracurricularDetails?.football?.experience || 0;

      if (basketballExp >= 100) {
        updated = assignHSRanking(updated, "basketball");
      } else if (footballExp >= 100) {
        updated = assignHSRanking(updated, "football");
      }
    }

    // 11.19.2025 - College recruitment (age 18, team captain)
    if (updated.age === 18 && !updated.collegeAthlete && !updated.collegeOffersGenerated) {
      const { checkCollegeRecruitment, generateCollegeOffers } = require("./domains/collegeAthletics.js");
      const recruitmentData = checkCollegeRecruitment(updated);

      if (recruitmentData) {
        updated.collegeRecruitmentOffers = generateCollegeOffers(updated, recruitmentData);
        updated.collegeRecruitmentSport = recruitmentData.sport;
        updated.showCollegeRecruitmentModal = true;
        updated.collegeOffersGenerated = true;
      }
    }

    // 11.13.2025 - v1.07.0: Early childhood events (0-5)
    if (updated.age <= 5) {
      try {
        const { triggerEarlyChildhoodEvent } = require("./domains/events/earlyChildhoodEvents.js");
        const eventResult = triggerEarlyChildhoodEvent(updated);
        if (eventResult) updated = eventResult;
      } catch (error) {
        console.error("Early childhood events error:", error);
      }
    }

    // 11.13.2025 - v1.07.0: Childhood events (5-11)
    if (updated.age >= 5 && updated.age < 12) {
      try {
        const { triggerChildhoodEvent } = require("./domains/events/childhoodEvents.js");
        const eventResult = triggerChildhoodEvent(updated);
        if (eventResult) updated = eventResult;
      } catch (error) {
        console.error("Childhood events error:", error);
      }
    }

    // 11.15.2025 - v1.07.0: Pregnancy system (16+)
    if (updated.age >= 16) {
      try {
        const { triggerPregnancySystem } = require("./domains/events/pregnancyEvents.js");
        const pregnancyResult = triggerPregnancySystem(updated);
        if (pregnancyResult) {
          updated = pregnancyResult;
        }
      } catch (error) {
        console.error("Pregnancy events error:", error);
      }
    }

    if (!ageUpActionResult && !shouldShowExtracurricularOffer && !shouldShowDrivingTest && !updated.showPregnancyModal && !updated.showCollegeRecruitmentModal && !updated.showUniversityOptions) {
      try {
        const { triggerLifeStagePopupEvent } = require("./domains/events/lifeStagePopupEvents.js");
        const popupResult = triggerLifeStagePopupEvent(updated);
        if (popupResult) {
          updated = popupResult.updated;
          ageUpActionResult = popupResult.actionResult;
        }
      } catch (error) {
        console.error("Life stage popup events error:", error);
      }
    }

    saveAndSetLife(updated);
    const milestone = getAgeMilestone(updated.age, updated);
    if (milestone) {
      setMilestoneBanner(milestone);
    } else if (activeTab !== "home") {
      setMilestoneBanner({
        eyebrow: "Year advanced",
        title: `${updated.firstName} has turned ${updated.age}!`,
      });
    }

    if (shouldShowExtracurricularOffer) {
      setShowExtracurricularOffer(true);
      return;
    }

    if (shouldShowDrivingTest) {
      setShowDrivingTestModal(true);
      return;
    }

    if (updated.showPregnancyModal) {
      setShowPregnancyModal(true);
      return;
    }

    // 11.19.2025 - Check if college recruitment modal should show
    if (updated.showCollegeRecruitmentModal) {
      setShowCollegeRecruitmentModal(true);
      return;
    }

    if (ageUpActionResult) {
      showResultPayload(ageUpActionResult);
      return;
    }

    maybeTriggerNpcPrompt(updated);
  }

  // 11.11.2025 - Fixed Start New Life to properly reset and show char creation
  function handleStartNewLife() {
    setShowSettingsModal(false);
    setLife(null); // Clear current life
    setActiveTab("home");
    setTimeout(() => {
      setShowCharCreation(true);
    }, 100); // Small delay to ensure state updates
  }

  function handleSeeAllLives() {
    setShowSettingsModal(false);
    setShowAllLivesModal(true);
  }

  function handleSelectLife(lifeId) {
    const selectedLife = allLives.find((savedLife) => savedLife.lifeId === lifeId);
    if (!selectedLife) return;
    setLife(selectedLife);
    setShowAllLivesModal(false);
    setActiveTab("home");
    setNavigationHistory([]);
  }

  function handleDeleteLife(lifeId) {
    const updatedLives = deleteLifeFromStorage(lifeId, allLives);
    setAllLives(updatedLives);
    if (life && life.lifeId === lifeId) {
      setLife(null);
    }
  }

  // 11.11.2025 - Added customPrice parameter for massage modal
  function handleActivityClick(type, customPrice) {
    const result = handleActivity(life, type, customPrice);
    saveAndSetLife(result.updated || result);
    showResultPayload(result.actionResult);
  }

  function handleStudyHarderClick() {
    const oldGrade = getGradePercent(life);
    const updated = handleStudyHarder(life);
    const newGrade = getGradePercent(updated);
    saveAndSetLife(updated);
    setShowSchoolPanel(false);
    showResultPayload({
      title: "You studied harder",
      message: "The extra effort pushed school a little more to the center of the year.",
      changes: [
        updated.intelligence > life.intelligence ? `+${updated.intelligence - life.intelligence} Intelligence` : null,
        updated.stress > life.stress ? `+${updated.stress - life.stress} Stress` : null,
        newGrade !== oldGrade ? `${newGrade > oldGrade ? "+" : ""}${newGrade - oldGrade} Grade` : null,
      ].filter(Boolean),
    });
  }

  function handleSlackOffClick() {
    const oldGrade = getGradePercent(life);
    const updated = handleSlackOff(life);
    const newGrade = getGradePercent(updated);
    saveAndSetLife(updated);
    setShowSchoolPanel(false);
    showResultPayload({
      title: "You slacked off",
      message: "You pulled back from school pressure and let the year breathe a bit more.",
      changes: [
        updated.stress < life.stress ? `-${life.stress - updated.stress} Stress` : null,
        newGrade !== oldGrade ? `${newGrade > oldGrade ? "+" : ""}${newGrade - oldGrade} Grade` : null,
      ].filter(Boolean),
    });
  }

  function handleFreelanceGigClick(type) {
    if (life.actionLimits.freelanceGigs >= 3) return;
    const gig = generateFreelanceGig(type);
    setCurrentGig(gig);
    setShowFreelanceGigModal(true);
  }

  function handleAcceptGig() {
    const updated = acceptFreelanceGig(life, currentGig);
    saveAndSetLife(updated);
    setShowFreelanceGigModal(false);
    setCurrentGig(null);
    showResultPayload({
      title: "Gig accepted",
      name: currentGig?.title || "Freelance work",
      message: "You picked up the work and added a little more money pressure to the year.",
      changes: currentGig?.totalPay ? [`+$${currentGig.totalPay} Cash`] : [],
      callout: "These smaller jobs can quietly shape money, stress, and momentum.",
    });
  }

  function handleDeclineGig() {
    setShowFreelanceGigModal(false);
    setCurrentGig(null);
  }

  function handleNpcPromptChoice(choiceId) {
    const result = resolveNpcPrompt(life, currentNpcPrompt, choiceId);
    saveAndSetLife(result.updated);
    setShowNpcPromptModal(false);
    setCurrentNpcPrompt(null);
    showResultPayload(result.actionResult);
  }

  function handleSelectPerson(person, fromView) {
    setSelectedPerson(person);
    setReturnView(fromView || activeTab);
    setShowInteractionModal(true);
  }

  function handleInteractionClick(action) {
    const result = handleInteraction(life, selectedPerson, action);

    if (result && result.befriendResult) {
      saveAndSetLife(result.updated);
      setBefriendResult(result.befriendResult);
      setShowInteractionModal(false);
      setShowBefriendResultModal(true);
      setSelectedPerson(null);
    } else if (result && result.actionResult) {
      saveAndSetLife(result.updated);
      setActionResult(result.actionResult);
      setShowInteractionModal(false);
      setShowActionResultModal(true);
      setSelectedPerson(null);
    } else {
      saveAndSetLife(result?.updated || result);
      setShowInteractionModal(false);
      setSelectedPerson(null);
    }
  }

  function handleExtracurricularOfferChoice(choice) {
    setShowExtracurricularOffer(false);

    if (choice === "sport") {
      setShowSportSelectionModal(true);
    } else if (choice === "band") {
      const tryout = generateTryout("band");
      setCurrentTryout(tryout);
      setShowTryoutModal(true);
    } else if (choice === "choir") {
      const tryout = generateTryout("choir");
      setCurrentTryout(tryout);
      setShowTryoutModal(true);
    } else if (choice === "club") {
      // Randomly pick a club
      const clubs = ["mathClub", "scienceClub", "studentGov"];
      const clubChoice = clubs[Math.floor(Math.random() * clubs.length)];
      const tryout = generateTryout(clubChoice);
      setCurrentTryout(tryout);
      setShowTryoutModal(true);
    }
  }

  function handleSportSelection(sport) {
    setShowSportSelectionModal(false);
    const tryout = generateTryout(sport);
    setCurrentTryout(tryout);
    setShowTryoutModal(true);
  }

  function handleExtracurricularClick(type) {
    const tryout = generateTryout(type);
    setCurrentTryout(tryout);
    setShowTryoutModal(true);
  }

  function handleAcceptTryout() {
    const result = attemptTryout(life, currentTryout);
    let updated = result.updated || result;

    // Generate teammates if activity was joined
    if (updated.extracurriculars && updated.extracurriculars.includes(currentTryout.activity)) {
      const teammateCount = currentTryout.activity === "football" ? 10 : currentTryout.activity === "soccer" ? 11 : currentTryout.activity === "basketball" ? 8 : 6;
      const teammates = generateTeammates(updated.origin, currentTryout.activity, teammateCount, updated.gender);
      if (updated.extracurricularDetails && updated.extracurricularDetails[currentTryout.activity]) {
        updated.extracurricularDetails[currentTryout.activity].teammates = teammates;
      }
    }

    saveAndSetLife(updated);
    setShowTryoutModal(false);
    setCurrentTryout(null);
    showResultPayload(result.actionResult);
  }

  function handleDeclineTryout() {
    setShowTryoutModal(false);
    setCurrentTryout(null);
  }

  function handleTakeDrivingTest() {
    const result = takeDrivingTest(life);
    saveAndSetLife(result.updated);
    setShowDrivingTestModal(false);
    showResultPayload(result.actionResult);
  }

  function handleSkipDrivingTest() {
    const result = skipDrivingTest(life);
    saveAndSetLife(result.updated);
    setShowDrivingTestModal(false);
    showResultPayload(result.actionResult);
  }

  function handleOpenActivityDetail(activity) {
    setCurrentActivity(activity);
    setShowActivityDetailPanel(true);
  }

  function handlePracticeActivity() {
    const result = practiceActivity(life, currentActivity);
    saveAndSetLife(result.updated || result);
    setShowActivityDetailPanel(false);
    setCurrentActivity(null);
    showResultPayload(result.actionResult);
  }

  function handleDropActivity() {
    const updated = dropActivity(life, currentActivity);
    saveAndSetLife(updated);
    setShowActivityDetailPanel(false);
    setCurrentActivity(null);
    showResultPayload({
      title: "You stepped away",
      name: currentActivity,
      message: "That commitment is no longer steering the year.",
      callout: "Dropping something opens time back up, but it changes the shape of this chapter too.",
    });
  }

  function handleCloseInteractionModal() {
    setShowInteractionModal(false);
    setSelectedPerson(null);
  }

  // 11.11.2025 - Phase 2.1: Part-time jobs handlers
  function handleApplyForJob(jobType) {
    saveAndSetLife(applyForJob(life, jobType));
  }

  function handleWorkShift() {
    saveAndSetLife(workShift(life));
    setShowPartTimeJobsPanel(false);
  }

  function handleQuitJob() {
    saveAndSetLife(quitJob(life));
    setShowPartTimeJobsPanel(false);
  }

  // 11.11.2025 - v1.00.10: Full-Time Job Handlers
  // 11.13.2025 - v1.06.0: Updated to handle result object and show modal
  function handleApplyFullTimeJob(jobKey) {
    const { applyForFullTimeJob } = require("./domains/fullTimeJobs.js");
    const { generateCoworkers } = require("./domains/coworkers.js");
    const result = applyForFullTimeJob(life, jobKey);

    // Extract updated life from result
    let updated = result.updated;

    // 11.11.2025 - v1.02.0: Generate coworkers if job was successfully obtained
    if (updated.fullTimeJob && updated.fullTimeJob.coworkers) {
      updated.fullTimeJob.coworkers = generateCoworkers(updated, updated.fullTimeJob.tier || 1);
    }

    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);

    // 11.13.2025 - v1.06.0: Show result modal
    setJobApplicationResult(result);
    setShowJobApplicationModal(true);
    setShowFullTimeJobsPanel(false);
  }

  function handleWorkOvertime() {
    const { workOvertime } = require("./domains/fullTimeJobs.js");
    const updated = workOvertime(life);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
  }

  function handleTakeBreak() {
    const { takeBreak } = require("./domains/fullTimeJobs.js");
    const updated = takeBreak(life);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
  }

  function handleAskRaise() {
    const { askForRaise } = require("./domains/fullTimeJobs.js");
    const updated = askForRaise(life);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
  }

  function handlePursuePromotion() {
    const { pursuePromotion } = require("./domains/fullTimeJobs.js");
    const updated = pursuePromotion(life);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
  }

  function handleNetworkAtWork() {
    const { networkAtWork } = require("./domains/fullTimeJobs.js");
    const updated = networkAtWork(life);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
  }

  function handleQuitFullTimeJob() {
    const { quitFullTimeJob } = require("./domains/fullTimeJobs.js");
    const updated = quitFullTimeJob(life);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
    setShowFullTimeJobsPanel(false);
  }

  // 11.11.2025 - v1.02.0: Coworker interaction handler
  function handleCoworkerInteraction(coworkerId, action) {
    const { interactWithCoworker } = require("./domains/coworkers.js");
    const updated = interactWithCoworker(life, coworkerId, action);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
  }

  // 11.11.2025 - v1.00.10: Special Career Handlers
  function handleStartSpecialCareer(careerKey) {
    const { startSpecialCareer } = require("./domains/specialCareers.js");
    const updated = startSpecialCareer(life, careerKey);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
    setShowSpecialCareersPanel(false);
  }

  function handleQuitSpecialCareer() {
    const { quitSpecialCareer } = require("./domains/specialCareers.js");
    const updated = quitSpecialCareer(life);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
    setShowSpecialCareersPanel(false);
  }

  // 11.11.2025 - v1.00.10: Detective Case Handlers
  function handleAssignCase() {
    const { assignCase } = require("./domains/detectiveCases.js");
    const updated = assignCase(life);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
  }

  function handleWorkCaseOvertime() {
    const { workCaseOvertime } = require("./domains/detectiveCases.js");
    const updated = workCaseOvertime(life);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
  }

  function handleAbandonCase() {
    const { abandonCase } = require("./domains/detectiveCases.js");
    const updated = abandonCase(life);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
    setShowDetectiveCasePanel(false);
  }

  // 11.11.2025 - Extracurricular action handler with proper state saving (includes clique actions)
  function handleActivityActionClick(activity, action) {
    let result;

    // Handle clique actions separately
    if (activity === "clique") {
      const { handleCliqueInteraction } = require("./domains/cliques.js");
      const updated = handleCliqueInteraction(life, action);
      result = {
        updated,
        actionResult: {
          title: "Group moment",
          name: life.clique || "Clique",
          message: "You leaned further into the social scene tied to this chapter.",
        },
      };
    } else {
      result = handleActivityAction(life, activity, action);
    }

    saveAndSetLife(result.updated || result);
    showResultPayload(result.actionResult);
  }

  // 11.11.2025 - Handler for trying to join different cliques
  function handleTryJoinClique(targetClique, approach) {
    const { tryJoinClique } = require("./domains/cliques.js");
    const updated = tryJoinClique(life, targetClique, approach);

    saveAndSetLife(updated);
    setShowCliqueBrowserModal(false);
    showResultPayload({
      title: "Social move made",
      name: targetClique,
      message: approach === "askJoin"
        ? "You pushed the social story forward and found out where you stand."
        : "You hovered near the scene without fully stepping into it yet.",
    });
  }

  // 11.11.2025 - Phase 2.2: Clique interaction handler
  function handleCliqueActionClick(action) {
    const { handleCliqueInteraction } = require("./domains/cliques.js");
    const updated = handleCliqueInteraction(life, action);
    saveAndSetLife(updated);
    showResultPayload({
      title: "Clique moment",
      name: life.clique || "Clique",
      message: "That social world reacted to what you did.",
    });
  }

  // 11.11.2025 - University option handlers
  // 11.11.2025 - v1.03.0: Fixed scholarship crash - handle return objects correctly
  // 11.19.2025 - Greek life handlers
  function handleBrowseGreekLife() {
    const { generateGreekOrganizations } = require("./domains/cliques.js");

    // Generate organizations if not already generated
    if (!life.greekOrganizations) {
      const updated = { ...life };
      updated.greekOrganizations = generateGreekOrganizations(life);
      const updatedLives = saveLifeToStorage(updated, allLives);
      setAllLives(updatedLives);
      setLife(updated);
    }

    setShowGreekLifeModal(true);
  }

  function handleJoinGreekLife(orgChoice) {
    const { joinGreekLife } = require("./domains/cliques.js");
    const updated = joinGreekLife(life, orgChoice);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
    setShowGreekLifeModal(false);
  }

  function handleQuitGreekLife() {
    const { quitGreekLife } = require("./domains/cliques.js");
    const updated = quitGreekLife(life);
    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
  }

  // 11.19.2025 - College recruitment handlers
  function handleAcceptCollegeOffer(offer) {
    const { acceptCollegeOffer } = require("./domains/collegeAthletics.js");
    let updated = acceptCollegeOffer(life, offer);

    // Clear recruitment flags
    updated.showCollegeRecruitmentModal = false;
    updated.collegeRecruitmentOffers = null;

    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
    setShowCollegeRecruitmentModal(false);
    setActiveTab("home");
  }

  function handleDeclineCollegeOffers() {
    const updated = { ...life };
    updated.showCollegeRecruitmentModal = false;
    updated.collegeRecruitmentOffers = null;

    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
    setShowCollegeRecruitmentModal(false);
    setActiveTab("home");
  }

  // 11.15.2025 - v1.07.0: Pregnancy decision handlers
  function handlePregnancyDecision(decision) {
    const { keepBaby, askPartnerForTermination, denyPaternity, ghostPartner, coParent, tryToMakeItWork } = require("./domains/events/pregnancyEvents.js");

    let updated;
    const partnerId = life.pregnancyPartner?.id;

    switch (decision) {
      case "keep":
        updated = keepBaby(life, partnerId);
        break;
      case "terminate":
        updated = askPartnerForTermination(life, partnerId);
        break;
      case "deny":
        updated = denyPaternity(life, partnerId);
        break;
      case "ghost":
        updated = ghostPartner(life, partnerId);
        break;
      case "coparent":
        updated = coParent(life, partnerId);
        break;
      case "makeitwork":
        updated = tryToMakeItWork(life, partnerId);
        break;
      default:
        return;
    }

    // Clear pregnancy modal flags
    updated.showPregnancyModal = false;
    updated.pregnancyPartner = null;

    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);
    setShowPregnancyModal(false);
    setActiveTab("home");
  }

  // 11.13.2025 - v1.07.0: Enhanced with iterative choice tracking
  function handleUniversityOption(option) {
    const { applyForScholarship, payTuitionSelf, payTuitionParents, takeStudentLoan, skipUniversity } = require("./domains/university.js");
    let updated;
    let success = false;

    switch (option) {
      case "scholarship": {
        const scholarshipResult = applyForScholarship(life);
        updated = scholarshipResult.updated;
        success = scholarshipResult.awarded;
        if (!success) {
          setUniversityAttempts({ ...universityAttempts, scholarship: false });
        }
        break;
      }
      case "payTuition": {
        const payResult = payTuitionSelf(life);
        updated = payResult.updated;
        success = payResult.success;
        if (!success) {
          setUniversityAttempts({ ...universityAttempts, payTuition: false });
        }
        break;
      }
      case "parents": {
        const parentsResult = payTuitionParents(life);
        updated = parentsResult.updated;
        success = parentsResult.success;
        if (!success) {
          setUniversityAttempts({ ...universityAttempts, parents: false });
        }
        break;
      }
      case "loan":
        updated = takeStudentLoan(life);
        success = true; // Loans always succeed
        break;
      case "skip":
        updated = skipUniversity(life);
        success = true; // Skip always succeeds
        break;
      default:
        return;
    }

    // Only close modal and reset attempts on success or skip
    if (success || option === "skip") {
      updated.showUniversityOptions = false;
      setUniversityAttempts({}); // Reset attempts for next life/decision
    }

    const updatedLives = saveLifeToStorage(updated, allLives);
    setAllLives(updatedLives);
    setLife(updated);

    if (success || option === "skip") {
      setActiveTab("home");
    }
  }

  function renderOccupationView() {
    if (!showSchoolPanel && !showActivityDetailPanel && !showPartTimeJobsPanel && !showFullTimeJobsPanel && !showSpecialCareersPanel && !showDetectiveCasePanel) {
      return (
        <OccupationPanel
          life={life}
          onOpenSchool={() => setShowSchoolPanel(true)}
          onOpenActivity={handleOpenActivityDetail}
          onOpenPartTimeJobs={() => setShowPartTimeJobsPanel(true)}
          onOpenFullTimeJobs={() => setShowFullTimeJobsPanel(true)}
          onOpenSpecialCareers={() => setShowSpecialCareersPanel(true)}
          onOpenDetectiveCases={() => setShowDetectiveCasePanel(true)}
          onActivityAction={handleActivityActionClick}
          onFreelanceGig={handleFreelanceGigClick}
          popularity={calculatePopularity(life)}
          onStudyHarder={handleStudyHarderClick}
          onSlackOff={handleSlackOffClick}
          onDropOut={() => {}}
          onSelectClassmate={(person) => handleSelectPerson(person, "school")}
          onExtracurricular={handleExtracurricularClick}
          onBrowseCliques={() => setShowCliqueBrowserModal(true)}
          onApplyPartTimeJob={handleApplyForJob}
          onWorkShift={handleWorkShift}
          onQuitPartTimeJob={handleQuitJob}
          onBrowseGreekLife={handleBrowseGreekLife}
          onQuitGreekLife={handleQuitGreekLife}
        />
      );
    }

    if (showSchoolPanel) {
      return (
        <SchoolPanel
          life={life}
          popularity={calculatePopularity(life)}
          onStudyHarder={handleStudyHarderClick}
          onSlackOff={handleSlackOffClick}
          onDropOut={() => {}}
          onSelectClassmate={(person) => handleSelectPerson(person, "school")}
          onExtracurricular={handleExtracurricularClick}
          onCliqueAction={handleCliqueActionClick}
          onBrowseCliques={() => setShowCliqueBrowserModal(true)}
          onBack={() => setShowSchoolPanel(false)}
        />
      );
    }

    if (showPartTimeJobsPanel) {
      return (
        <PartTimeJobsPanel
          life={life}
          onApplyForJob={handleApplyForJob}
          onWorkShift={handleWorkShift}
          onQuitJob={handleQuitJob}
          onBack={() => setShowPartTimeJobsPanel(false)}
        />
      );
    }

    if (showFullTimeJobsPanel && !showCoworkerPanel) {
      return (
        <FullTimeJobsPanel
          life={life}
          onApplyForJob={handleApplyFullTimeJob}
          onWorkOvertime={handleWorkOvertime}
          onTakeBreak={handleTakeBreak}
          onAskRaise={handleAskRaise}
          onPursuePromotion={handlePursuePromotion}
          onNetworkAtWork={handleNetworkAtWork}
          onQuitJob={handleQuitFullTimeJob}
          onViewCoworkers={() => setShowCoworkerPanel(true)}
          onBack={() => setShowFullTimeJobsPanel(false)}
        />
      );
    }

    if (showCoworkerPanel) {
      return (
        <CoworkerPanel
          life={life}
          onInteract={handleCoworkerInteraction}
          onBack={() => setShowCoworkerPanel(false)}
        />
      );
    }

    if (showSpecialCareersPanel) {
      return (
        <SpecialCareersPanel
          life={life}
          onStartCareer={handleStartSpecialCareer}
          onQuitCareer={handleQuitSpecialCareer}
          onBack={() => setShowSpecialCareersPanel(false)}
        />
      );
    }

    if (showDetectiveCasePanel) {
      return (
        <DetectiveCasePanel
          life={life}
          onAssignCase={handleAssignCase}
          onWorkOvertime={handleWorkCaseOvertime}
          onAbandonCase={handleAbandonCase}
          onBack={() => setShowDetectiveCasePanel(false)}
        />
      );
    }

    if (showActivityDetailPanel && currentActivity) {
      return (
        <ExtracurricularDetailPanel
          life={life}
          activity={currentActivity}
          activityName={
            currentActivity === "basketball" ? "Basketball" :
            currentActivity === "soccer" ? "Soccer" :
            currentActivity === "football" ? "Football" :
            currentActivity === "tennis" ? "Tennis" :
            currentActivity === "wrestling" ? "Wrestling" :
            currentActivity === "band" ? "Band" :
            currentActivity === "choir" ? "Choir" :
            currentActivity === "mathClub" ? "Math Club" :
            currentActivity === "scienceClub" ? "Science Club" :
            currentActivity === "studentGov" ? "Student Government" : ""
          }
          onPractice={handlePracticeActivity}
          onDrop={handleDropActivity}
          onBack={() => {
            setShowActivityDetailPanel(false);
            setCurrentActivity(null);
          }}
        />
      );
    }

    return null;
  }

  function renderRouteFrame(title, child) {
    return (
      <View style={styles.routeScreen}>
        <View style={styles.routeHeader}>
          <TouchableOpacity style={styles.routeBackButton} onPress={handleBackNavigation}>
            <Text style={styles.routeBackText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.routeTitle}>{title}</Text>
          <TouchableOpacity style={styles.routeGhostButton} onPress={() => setShowSettingsModal(true)}>
            <Text style={styles.routeGhostButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
        <RouteIdentityStrip life={life} />
        <View style={styles.routeContent}>{child}</View>
      </View>
    );
  }

  function renderActiveView() {
    const feed = buildLifeFeed(life);

    if (activeTab !== "home" && !canAccessRoute(life, activeTab)) {
      return (
        <LifeFeed
          life={life}
          feed={feed}
          onOpenRoute={handleTabChange}
          onOpenSettings={() => setShowSettingsModal(true)}
          onSelectPerson={handleSelectPerson}
          onAgeUp={handleAgeUp}
          onOpenTimelineAge={handleOpenTimeline}
        />
      );
    }

    if (activeTab === "home") {
      return (
        <LifeFeed
          life={life}
          feed={feed}
          onOpenRoute={handleTabChange}
          onOpenSettings={() => setShowSettingsModal(true)}
          onSelectPerson={handleSelectPerson}
          onAgeUp={handleAgeUp}
          onOpenTimelineAge={handleOpenTimeline}
        />
      );
    }

    if (activeTab === "profile") {
      return (
        <ProfileHub
          life={life}
          onBack={handleBackNavigation}
          onOpenRoute={handleTabChange}
          onOpenSettings={() => setShowSettingsModal(true)}
          onSeeAllLives={handleSeeAllLives}
        />
      );
    }

    if (activeTab === "timeline") {
      return renderRouteFrame(
        "Timeline",
        <TimelineArchive life={life} initialAge={selectedTimelineAge} onOpenAge={setSelectedTimelineAge} />
      );
    }

    if (activeTab === "occupation") {
      return renderRouteFrame("Occupation", renderOccupationView());
    }

    if (activeTab === "relationships") {
      return renderRouteFrame(
        "Social",
        <ScrollView
          style={styles.routeScroll}
          contentContainerStyle={styles.routeScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <RelationshipsPanel life={life} onSelectPerson={handleSelectPerson} focusTarget={routeFocusTarget} />
        </ScrollView>
      );
    }

    if (activeTab === "activities") {
      return renderRouteFrame("Activities", <ActivitiesPanel life={life} onActivity={handleActivityClick} />);
    }

    if (activeTab === "assets") {
      return renderRouteFrame("Assets", <AssetsPanel life={life} />);
    }

    return null;
  }

  // ========== RENDER ==========
  // 11.11.2025 - Updated version to v1.00.08
  if (!life) {
    return (
      <SafeAreaView style={styles.safeScreen}>
        <View style={styles.startScreenCard}>
          <Text style={styles.startEyebrow}>SmolLyfe</Text>
          <Text style={styles.title}>Live a story worth scrolling.</Text>
          <Text style={styles.startScreenBody}>A phone-first life sim built around one continuous life feed.</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setShowCharCreation(true)}>
            <Text style={styles.startButtonText}>Start New Life</Text>
          </TouchableOpacity>
        </View>
        <CharCreationModal visible={showCharCreation} onCreateCharacter={handleCreateCharacter} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeScreen}>
      <MilestoneBanner banner={milestoneBanner} onDismiss={() => setMilestoneBanner(null)} />
      {renderActiveView()}

      {false && (
      <>
      {/* 11.11.2025 - Updated header to space money from settings cog */}
      <View style={styles.header}>
        <View>
          <Text style={styles.nameText}>{life.firstName} {life.lastName}</Text>
          <Text style={styles.subtitleText}>{life.occupation} · {life.city}</Text>
        </View>
        <View style={styles.headerRightSection}>
          <Text style={styles.moneyText}>${life.money}</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettingsModal(true)}>
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBars life={life} />

      <NavigationTabs activeTab={activeTab} onTabChange={handleTabChange} age={life.age} />

      <ScrollView style={styles.content}>
        {activeTab === "home" && <HistoryLog history={life.history} />}
        {/* 11.11.2025 - Updated Occupation panel conditions to include PartTimeJobsPanel */}
        {activeTab === "occupation" && !showSchoolPanel && !showActivityDetailPanel && !showPartTimeJobsPanel && !showFullTimeJobsPanel && !showSpecialCareersPanel && !showDetectiveCasePanel && (
          <OccupationPanel
            life={life}
            onOpenSchool={() => setShowSchoolPanel(true)}
            onOpenActivity={handleOpenActivityDetail}
            onOpenPartTimeJobs={() => setShowPartTimeJobsPanel(true)}
            onOpenFullTimeJobs={() => setShowFullTimeJobsPanel(true)}
            onOpenSpecialCareers={() => setShowSpecialCareersPanel(true)}
            onOpenDetectiveCases={() => setShowDetectiveCasePanel(true)}
            onActivityAction={handleActivityActionClick}
            onFreelanceGig={handleFreelanceGigClick}
            popularity={calculatePopularity(life)}
            onStudyHarder={handleStudyHarderClick}
            onSlackOff={handleSlackOffClick}
            onDropOut={() => {}}
            onSelectClassmate={(person) => handleSelectPerson(person, "school")}
            onExtracurricular={handleExtracurricularClick}
            onBrowseCliques={() => setShowCliqueBrowserModal(true)}
            onApplyPartTimeJob={handleApplyForJob}
            onWorkShift={handleWorkShift}
            onQuitPartTimeJob={handleQuitJob}
            onBrowseGreekLife={handleBrowseGreekLife}
            onQuitGreekLife={handleQuitGreekLife}
          />
        )}
        {activeTab === "occupation" && showSchoolPanel && (
          <SchoolPanel
            life={life}
            popularity={calculatePopularity(life)}
            onStudyHarder={handleStudyHarderClick}
            onSlackOff={handleSlackOffClick}
            onDropOut={() => {}}
            onSelectClassmate={(person) => handleSelectPerson(person, "school")}
            onExtracurricular={handleExtracurricularClick}
            onCliqueAction={handleCliqueActionClick}
            onBrowseCliques={() => setShowCliqueBrowserModal(true)}
            onBack={() => setShowSchoolPanel(false)}
          />
        )}
        {/* 11.11.2025 - Phase 2.1: Added PartTimeJobsPanel rendering */}
        {activeTab === "occupation" && showPartTimeJobsPanel && (
          <PartTimeJobsPanel
            life={life}
            onApplyForJob={handleApplyForJob}
            onWorkShift={handleWorkShift}
            onQuitJob={handleQuitJob}
            onBack={() => setShowPartTimeJobsPanel(false)}
          />
        )}
        {/* 11.11.2025 - v1.00.10: Phase 3 - Full-Time Jobs Panel */}
        {activeTab === "occupation" && showFullTimeJobsPanel && !showCoworkerPanel && (
          <FullTimeJobsPanel
            life={life}
            onApplyForJob={handleApplyFullTimeJob}
            onWorkOvertime={handleWorkOvertime}
            onTakeBreak={handleTakeBreak}
            onAskRaise={handleAskRaise}
            onPursuePromotion={handlePursuePromotion}
            onNetworkAtWork={handleNetworkAtWork}
            onQuitJob={handleQuitFullTimeJob}
            onViewCoworkers={() => setShowCoworkerPanel(true)}
            onBack={() => setShowFullTimeJobsPanel(false)}
          />
        )}
        {/* 11.11.2025 - v1.02.0: Coworker Panel */}
        {activeTab === "occupation" && showCoworkerPanel && (
          <CoworkerPanel
            life={life}
            onInteract={handleCoworkerInteraction}
            onBack={() => setShowCoworkerPanel(false)}
          />
        )}
        {/* 11.11.2025 - v1.00.10: Phase 3 - Special Careers Panel */}
        {activeTab === "occupation" && showSpecialCareersPanel && (
          <SpecialCareersPanel
            life={life}
            onStartCareer={handleStartSpecialCareer}
            onQuitCareer={handleQuitSpecialCareer}
            onBack={() => setShowSpecialCareersPanel(false)}
          />
        )}
        {/* 11.11.2025 - v1.00.10: Phase 3 - Detective Case Panel */}
        {activeTab === "occupation" && showDetectiveCasePanel && (
          <DetectiveCasePanel
            life={life}
            onAssignCase={handleAssignCase}
            onWorkOvertime={handleWorkCaseOvertime}
            onAbandonCase={handleAbandonCase}
            onBack={() => setShowDetectiveCasePanel(false)}
          />
        )}
        {activeTab === "occupation" && showActivityDetailPanel && currentActivity && (
          <ExtracurricularDetailPanel
            life={life}
            activity={currentActivity}
            activityName={
              currentActivity === "basketball" ? "Basketball" :
              currentActivity === "soccer" ? "Soccer" :
              currentActivity === "football" ? "Football" :
              currentActivity === "band" ? "Band" :
              currentActivity === "choir" ? "Choir" :
              currentActivity === "mathClub" ? "Math Club" :
              currentActivity === "scienceClub" ? "Science Club" :
              currentActivity === "studentGov" ? "Student Government" : ""
            }
            onPractice={handlePracticeActivity}
            onDrop={handleDropActivity}
            onBack={() => {
              setShowActivityDetailPanel(false);
              setCurrentActivity(null);
            }}
          />
        )}
        {activeTab === "relationships" && (
          <RelationshipsPanel life={life} onSelectPerson={handleSelectPerson} />
        )}
        {activeTab === "activities" && <ActivitiesPanel life={life} onActivity={handleActivityClick} />}
      </ScrollView>
      </>
      )}

      <View pointerEvents="none" style={styles.floatingAgeDock} />
      <TouchableOpacity style={styles.floatingAgeButton} onPress={handleAgeUp}>
        <Text style={styles.ageButtonText}>+ Age</Text>
        <Text style={styles.ageButtonSubtext}>Tap to live the next year.</Text>
      </TouchableOpacity>

      <InteractionModal
        visible={showInteractionModal}
        selectedPerson={selectedPerson}
        life={life}
        onInteraction={handleInteractionClick}
        onClose={handleCloseInteractionModal}
      />

      <FreelanceGigModal
        visible={showFreelanceGigModal}
        gigData={currentGig}
        onAccept={handleAcceptGig}
        onDecline={handleDeclineGig}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onStartNewLife={handleStartNewLife}
        onSeeAllLives={handleSeeAllLives}
      />

      <AllLivesModal
        visible={showAllLivesModal}
        lives={allLives}
        onClose={() => setShowAllLivesModal(false)}
        onSelectLife={handleSelectLife}
        onDeleteLife={handleDeleteLife}
      />

      <ExtracurricularOfferModal
        visible={showExtracurricularOffer}
        onSelectOption={handleExtracurricularOfferChoice}
        onClose={() => setShowExtracurricularOffer(false)}
      />

      <SportSelectionModal
        visible={showSportSelectionModal}
        onSelectSport={handleSportSelection}
        onClose={() => {
          setShowSportSelectionModal(false);
          setShowExtracurricularOffer(true);
        }}
      />

      <TryoutModal
        visible={showTryoutModal}
        tryoutData={currentTryout}
        onAccept={handleAcceptTryout}
        onDecline={handleDeclineTryout}
      />

      <DrivingTestModal
        visible={showDrivingTestModal}
        onTakeTest={handleTakeDrivingTest}
        onSkip={handleSkipDrivingTest}
      />

      <UniversityOptionsModal
        visible={life?.showUniversityOptions || false}
        life={life}
        attemptedOptions={universityAttempts}
        onApplyScholarship={() => handleUniversityOption("scholarship")}
        onPayTuition={(type) => handleUniversityOption(type === "self" ? "payTuition" : "parents")}
        onTakeLoan={() => handleUniversityOption("loan")}
        onSkipUniversity={() => handleUniversityOption("skip")}
      />

      {/* 11.11.2025 - Clique Browser Modal */}
      <CliqueBrowserModal
        visible={showCliqueBrowserModal}
        life={life}
        onInteract={handleTryJoinClique}
        onClose={() => setShowCliqueBrowserModal(false)}
      />

      {/* 11.11.2025 - v1.01.0: Befriend Result Modal */}
      <BefriendResultModal
        visible={showBefriendResultModal}
        result={befriendResult}
        onClose={() => {
          setShowBefriendResultModal(false);
          setBefriendResult(null);
          // Return to previous view (already set by handleInteractionClick)
        }}
      />

      <ActionResultModal
        visible={showActionResultModal}
        result={actionResult}
        onClose={() => {
          setShowActionResultModal(false);
          setActionResult(null);
          revealPendingQueuedModal();
        }}
      />

      <NpcPromptModal
        visible={showNpcPromptModal}
        prompt={currentNpcPrompt}
        onChoose={handleNpcPromptChoice}
        onClose={() => {
          setShowNpcPromptModal(false);
          setCurrentNpcPrompt(null);
        }}
      />

      {/* 11.13.2025 - v1.06.0: Job Application Result Modal */}
      <JobApplicationResultModal
        visible={showJobApplicationModal}
        result={jobApplicationResult}
        onClose={() => {
          setShowJobApplicationModal(false);
          setJobApplicationResult(null);
        }}
      />

      {/* 11.15.2025 - v1.07.0: Pregnancy Modal */}
      <PregnancyModal
        visible={showPregnancyModal}
        life={life}
        partnerName={life?.pregnancyPartner?.name}
        onKeepBaby={() => handlePregnancyDecision("keep")}
        onAskTermination={() => handlePregnancyDecision("terminate")}
        onDenyPaternity={() => handlePregnancyDecision("deny")}
        onGhost={() => handlePregnancyDecision("ghost")}
        onCoParent={() => handlePregnancyDecision("coparent")}
        onMakeItWork={() => handlePregnancyDecision("makeitwork")}
      />

      {/* 11.19.2025 - Greek Life Modal */}
      <GreekLifeModal
        visible={showGreekLifeModal}
        life={life}
        organizations={life?.greekOrganizations}
        onJoinOrg={handleJoinGreekLife}
        onClose={() => setShowGreekLifeModal(false)}
      />

      {/* 11.19.2025 - College Recruitment Modal */}
      <CollegeRecruitmentModal
        visible={showCollegeRecruitmentModal}
        sport={life?.collegeRecruitmentSport}
        offers={life?.collegeRecruitmentOffers}
        hsRanking={life?.hsAthletics?.ranking}
        onAcceptOffer={handleAcceptCollegeOffer}
        onDecline={handleDeclineCollegeOffers}
      />
    </SafeAreaView>
  );
}
