// SmolLyfe v1.00.03 - Part 1: Classmate Interactions, Family Variety, Bond System, Romantic Lifecycle
// Updates: Full classmate modals, dynamic family activities, relationship bond tracking, dating system

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';

export default function App() {
  const [life, setLife] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showCharCreation, setShowCharCreation] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  // ========== HELPERS ==========
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function addHistory(lifeObj, text) {
    const age = lifeObj.age;
    if (!lifeObj.history[age]) lifeObj.history[age] = [];
    lifeObj.history[age].unshift(text);
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getFirstName(origin) {
    const nameDB = {
      USA: ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'James'],
      Mexico: ['María', 'José', 'Guadalupe', 'Juan', 'Juana', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Miguel'],
      Korea: ['Min-ji', 'Seo-yeon', 'Ji-woo', 'Ha-yoon', 'Soo-min', 'Ji-hoon', 'Joon', 'Tae-yang', 'Ye-jun', 'Min-ho'],
      Nigeria: ['Chinedu', 'Ngozi', 'Emeka', 'Adaeze', 'Chioma', 'Obinna', 'Kelechi', 'Amara', 'Ifeanyi', 'Blessing'],
      UK: ['Oliver', 'Amelia', 'George', 'Isla', 'Harry', 'Ava', 'Jack', 'Emily', 'Jacob', 'Ella'],
    };
    return randChoice(nameDB[origin] || nameDB.USA);
  }

  function getLastName(origin) {
    const surnameDB = {
      USA: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson'],
      Mexico: ['García', 'Rodríguez', 'Hernández', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres'],
      Korea: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang', 'Lim'],
      Nigeria: ['Okafor', 'Nwankwo', 'Adebayo', 'Okonkwo', 'Eze', 'Udoh', 'Okoro', 'Chukwu', 'Ojo', 'Bello'],
      UK: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright'],
    };
    return randChoice(surnameDB[origin] || surnameDB.USA);
  }

  function getCityByOrigin(origin) {
    const cities = {
      USA: ['New York City, USA', 'Los Angeles, USA', 'Chicago, USA', 'Houston, USA', 'Phoenix, USA'],
      Mexico: ['Mexico City, Mexico', 'Guadalajara, Mexico', 'Monterrey, Mexico', 'Puebla, Mexico', 'Cancún, Mexico'],
      Korea: ['Seoul, South Korea', 'Busan, South Korea', 'Incheon, South Korea', 'Daegu, South Korea', 'Daejeon, South Korea'],
      Nigeria: ['Lagos, Nigeria', 'Kano, Nigeria', 'Ibadan, Nigeria', 'Abuja, Nigeria', 'Port Harcourt, Nigeria'],
      UK: ['London, UK', 'Manchester, UK', 'Birmingham, UK', 'Glasgow, UK', 'Liverpool, UK'],
    };
    return randChoice(cities[origin] || cities.USA);
  }

  function generateNPC(relation, parentAge, origin, lastName) {
    const firstName = getFirstName(origin);
    const age = relation === 'Mother' || relation === 'Father' ? parentAge : randInt(0, 18);
    return {
      id: Date.now() + Math.random(),
      firstName,
      lastName,
      relation,
      age,
      occupation: relation === 'Mother' || relation === 'Father' ? randChoice(['Teacher', 'Nurse', 'Engineer', 'Bartender', 'Truck Driver']) : null,
      bond: 100,
      relationshipStatus: 'family', // family, friend, dating, partner, married
    };
  }

  function generateClassmate(origin, playerAge) {
    const firstName = getFirstName(origin);
    const lastName = getLastName(origin);
    return {
      id: Date.now() + Math.random(),
      firstName,
      lastName,
      relation: 'Classmate',
      age: playerAge,
      occupation: null,
      bond: randInt(20, 60),
      relationshipStatus: 'acquaintance',
    };
  }

  // ========== CHARACTER CREATION ==========
  function handleCreateCharacter(formData) {
    const { firstName, lastName, origin, gender } = formData;
    const city = getCityByOrigin(origin);
    const motherAge = randInt(22, 35);
    const fatherAge = randInt(24, 37);

    const mother = generateNPC('Mother', motherAge, origin, lastName);
    const father = generateNPC('Father', fatherAge, origin, lastName);

    const newLife = {
      firstName,
      lastName,
      origin,
      city,
      gender,
      age: 0,
      money: 0,
      intelligence: randInt(30, 70),
      attractiveness: randInt(30, 70),
      stress: randInt(5, 15),
      fame: 0,
      health: 100,
      happiness: randInt(60, 90),
      occupation: 'Infant',
      relationships: [mother, father],
      classmates: [],
      history: {},
      yearlyCounters: {},
    };

    addHistory(newLife, 'I was born. A whole new storyline just unlocked.');
    addHistory(newLife, `I was born at their home to my mother ${mother.firstName} ${mother.lastName} (age ${mother.age}) and my father ${father.firstName} ${father.lastName} (age ${father.age}). They are happily married.`);

    setLife(newLife);
    setShowCharCreation(false);
    setActiveTab('home');
  }

  // ========== AGE UP LOGIC ==========
  function handleAgeUp() {
    const updated = deepClone(life);
    updated.age += 1;
    updated.yearlyCounters = {};

    // Age family members
    updated.relationships.forEach(rel => {
      if (rel.relation === 'Mother' || rel.relation === 'Father' || rel.relation.includes('Sibling')) {
        rel.age += 1;
      }
    });

    // Age classmates
    updated.classmates.forEach(c => c.age += 1);

    // Life stage transitions
    if (updated.age === 1) {
      addHistory(updated, 'I took my first steps. My parents went absolutely feral.');
    }
    if (updated.age === 2) {
      addHistory(updated, 'I survived another trip around the sun.');
    }
    if (updated.age === 3) {
      addHistory(updated, 'The year slides by with background character energy.');
    }
    if (updated.age === 5) {
      updated.occupation = 'Elementary School Student';
      addHistory(updated, 'I met my classmates for the first time.');
      addHistory(updated, 'I started elementary school student.');
      // Generate classmates
      for (let i = 0; i < 8; i++) {
        updated.classmates.push(generateClassmate(updated.origin, updated.age));
      }
    }
    if (updated.age === 12) {
      updated.occupation = 'Middle School Student';
      addHistory(updated, 'I started middle school.');
    }
    if (updated.age === 14) {
      updated.occupation = 'High School Student';
      addHistory(updated, 'I started high school.');
    }
    if (updated.age === 18) {
      updated.occupation = 'High School Graduate';
      addHistory(updated, 'I finished high school. Diplomas are forever.');
    }

    // Random sibling births
    if (updated.age >= 3 && updated.age <= 10 && Math.random() < 0.15) {
      const siblingGender = Math.random() < 0.5 ? 'boy' : 'girl';
      const siblingName = getFirstName(updated.origin);
      const sibling = {
        id: Date.now() + Math.random(),
        firstName: siblingName,
        lastName: updated.lastName,
        relation: updated.age < 5 ? 'Younger Sibling' : 'Little Sibling',
        age: 0,
        occupation: null,
        bond: 100,
        relationshipStatus: 'family',
      };
      updated.relationships.push(sibling);
      addHistory(updated, `My ${updated.relationships.find(r => r.relation === 'Mother').firstName} and ${updated.relationships.find(r => r.relation === 'Father').firstName} had a baby ${siblingGender} named ${siblingName}, my new ${sibling.relation.toLowerCase()}.`);
    }

    addHistory(updated, 'The year slides by with background character energy.');
    setLife(updated);
    setActiveTab('home');
  }

  // ========== INTERACTION LOGIC ==========
  function handleInteraction(action) {
    const updated = deepClone(life);
    const personIndex = updated.relationships.findIndex(p => p.id === selectedPerson.id);
    const classmateIndex = updated.classmates.findIndex(p => p.id === selectedPerson.id);
    
    let person = personIndex >= 0 ? updated.relationships[personIndex] : updated.classmates[classmateIndex];
    let targetArray = personIndex >= 0 ? updated.relationships : updated.classmates;
    let targetIndex = personIndex >= 0 ? personIndex : classmateIndex;

    // Enhanced family activity variety
    const familyActivities = {
      Mother: [
        'went to the movies',
        'took me laser tagging',
        'took me to the mall',
        'cooked dinner together',
        'went for a walk in the park',
        'had a heart-to-heart talk',
      ],
      Father: [
        'went to the movies',
        'took me to a baseball game',
        'taught me how to fix the car',
        'went fishing',
        'played basketball together',
        'grilled burgers in the backyard',
      ],
      'Younger Sibling': [
        'went to the bodega together',
        'played video games together',
        'went to the park',
        'watched cartoons together',
        'built a blanket fort',
      ],
      'Little Sibling': [
        'went to the bodega together',
        'played video games together',
        'went to the park',
        'watched cartoons together',
        'built a blanket fort',
      ],
    };

    switch (action) {
      case 'spendTime':
        if (person.relation === 'Mother' || person.relation === 'Father' || person.relation.includes('Sibling')) {
          const activities = familyActivities[person.relation] || ['spent quality time together'];
          const activity = randChoice(activities);
          addHistory(updated, `My ${person.relation.toLowerCase()} and I ${activity}.`);
          person.bond = Math.min(100, person.bond + randInt(3, 8));
        } else {
          addHistory(updated, `I spent quality time with ${person.firstName} ${person.lastName}.`);
          person.bond = Math.min(100, person.bond + randInt(3, 8));
        }
        break;

      case 'compliment':
        const compliments = [
          'Your style is incredible!',
          'You always know how to make me laugh.',
          'I really admire your confidence.',
          'You have such a good heart.',
        ];
        const compliment = randChoice(compliments);
        addHistory(updated, `I complimented ${person.firstName}: "${compliment}"`);
        person.bond = Math.min(100, person.bond + randInt(5, 10));
        break;

      case 'giveGift':
        const gifts = ['flowers', 'chocolates', 'a handwritten note', 'a small bracelet', 'their favorite snack'];
        const gift = randChoice(gifts);
        const cost = randInt(10, 30);
        if (updated.money >= cost) {
          updated.money -= cost;
          addHistory(updated, `I gave ${person.firstName} ${gift}. It cost $${cost}.`);
          person.bond = Math.min(100, person.bond + randInt(8, 15));
        } else {
          addHistory(updated, `I tried to buy ${person.firstName} a gift but couldn't afford it.`);
        }
        break;

      case 'askOnDate':
        if (person.relationshipStatus === 'acquaintance' || person.relationshipStatus === 'friend') {
          if (person.bond >= 60) {
            person.relationshipStatus = 'dating';
            addHistory(updated, `I asked ${person.firstName} on a date. They said yes! We're dating now.`);
            person.bond = Math.min(100, person.bond + 10);
          } else {
            addHistory(updated, `I asked ${person.firstName} on a date. They politely declined.`);
            person.bond = Math.max(0, person.bond - 5);
          }
        } else if (person.relationshipStatus === 'dating') {
          addHistory(updated, `${person.firstName} and I went on a romantic date.`);
          person.bond = Math.min(100, person.bond + randInt(5, 10));
        }
        break;

      case 'befriend':
        if (person.relationshipStatus === 'acquaintance') {
          person.relationshipStatus = 'friend';
          addHistory(updated, `${person.firstName} and I became friends!`);
          person.bond = Math.min(100, person.bond + 15);
        } else {
          addHistory(updated, `I tried to deepen my friendship with ${person.firstName}.`);
          person.bond = Math.min(100, person.bond + randInt(3, 7));
        }
        break;

      case 'insult':
        const insults = [
          'Your taste in music is terrible.',
          'You talk too much.',
          'Nobody asked for your opinion.',
          'You're embarrassing yourself.',
        ];
        const insult = randChoice(insults);
        addHistory(updated, `I insulted ${person.firstName}: "${insult}"`);
        person.bond = Math.max(0, person.bond - randInt(10, 20));
        break;

      case 'propose':
        if (person.relationshipStatus === 'dating' && person.bond >= 80) {
          person.relationshipStatus = 'engaged';
          addHistory(updated, `I proposed to ${person.firstName}. They said yes! We're engaged!`);
          person.bond = 100;
        } else {
          addHistory(updated, `I proposed to ${person.firstName}, but they weren't ready yet.`);
          person.bond = Math.max(0, person.bond - 10);
        }
        break;

      case 'marry':
        if (person.relationshipStatus === 'engaged') {
          person.relationshipStatus = 'married';
          person.relation = 'Spouse';
          addHistory(updated, `${person.firstName} and I got married! We're officially a family now.`);
          person.bond = 100;
        }
        break;
    }

    targetArray[targetIndex] = person;
    setLife(updated);
    setShowInteractionModal(false);
    setSelectedPerson(null);
    setActiveTab('home');
  }

  // ========== SCHOOL ACTIONS ==========
  function handleStudyHarder() {
    const updated = deepClone(life);
    const gain = randInt(2, 5);
    updated.intelligence = Math.min(100, updated.intelligence + gain);
    updated.stress = Math.min(100, updated.stress + randInt(3, 7));
    addHistory(updated, 'I studied harder. My brain expanded.');
    setLife(updated);
    setActiveTab('home');
  }

  // ========== ACTIVITIES ==========
  function handleActivity(type) {
    const updated = deepClone(life);
    switch (type) {
      case 'run':
        updated.health = Math.min(100, updated.health + randInt(1, 3));
        updated.stress = Math.max(0, updated.stress - randInt(2, 5));
        addHistory(updated, 'I went for a run. Endorphins flooded in.');
        break;
      case 'meditate':
        updated.stress = Math.max(0, updated.stress - randInt(5, 10));
        updated.happiness = Math.min(100, updated.happiness + randInt(3, 6));
        addHistory(updated, 'I meditated. Inner peace located.');
        break;
    }
    setLife(updated);
    setActiveTab('home');
  }

  // ========== FREELANCE GIGS ==========
  function handleFreelanceGig(type) {
    const updated = deepClone(life);
    let earnings = 0;
    switch (type) {
      case 'tutor':
        earnings = randInt(40, 80);
        addHistory(updated, `I tutored someone and earned $${earnings}.`);
        break;
      case 'mowLawn':
        earnings = randInt(20, 50);
        addHistory(updated, `I mowed a lawn and earned $${earnings}.`);
        break;
    }
    updated.money += earnings;
    setLife(updated);
    setActiveTab('home');
  }

  // ========== UI COMPONENTS ==========
  function CharCreationModal() {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      origin: 'USA',
      gender: 'Male',
    });

    return (
      <Modal visible={showCharCreation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Your Character</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#666"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#666"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.smallButton, formData.gender === 'Male' && styles.smallButtonActive]}
                onPress={() => setFormData({ ...formData, gender: 'Male' })}
              >
                <Text style={styles.smallButtonText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallButton, formData.gender === 'Female' && styles.smallButtonActive]}
                onPress={() => setFormData({ ...formData, gender: 'Female' })}
              >
                <Text style={styles.smallButtonText}>Female</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => handleCreateCharacter(formData)}
            >
              <Text style={styles.createButtonText}>Start Life</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  function InteractionModal() {
    if (!selectedPerson) return null;

    const isFamily = selectedPerson.relation === 'Mother' || selectedPerson.relation === 'Father' || selectedPerson.relation.includes('Sibling');
    const isClassmate = selectedPerson.relation === 'Classmate';
    const isDating = selectedPerson.relationshipStatus === 'dating';
    const isEngaged = selectedPerson.relationshipStatus === 'engaged';

    return (
      <Modal visible={showInteractionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedPerson.firstName} {selectedPerson.lastName}</Text>
            <Text style={styles.modalSubtitle}>{selectedPerson.relation} · Bond: {selectedPerson.bond}/100</Text>
            <Text style={styles.modalSubtitle}>Status: {selectedPerson.relationshipStatus}</Text>

            <TouchableOpacity style={styles.actionButton} onPress={() => handleInteraction('spendTime')}>
              <Text style={styles.actionButtonText}>Spend Time</Text>
            </TouchableOpacity>

            {!isFamily && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleInteraction('compliment')}>
                  <Text style={styles.actionButtonText}>Compliment</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleInteraction('giveGift')}>
                  <Text style={styles.actionButtonText}>Give Gift</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleInteraction('befriend')}>
                  <Text style={styles.actionButtonText}>Befriend</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleInteraction('askOnDate')}>
                  <Text style={styles.actionButtonText}>{isDating ? 'Go on Date' : 'Ask on Date'}</Text>
                </TouchableOpacity>
                {isDating && (
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleInteraction('propose')}>
                    <Text style={styles.actionButtonText}>Propose</Text>
                  </TouchableOpacity>
                )}
                {isEngaged && (
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleInteraction('marry')}>
                    <Text style={styles.actionButtonText}>Get Married</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionButtonDanger} onPress={() => handleInteraction('insult')}>
                  <Text style={styles.actionButtonText}>Insult</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowInteractionModal(false);
                setSelectedPerson(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ========== RENDER ==========
  if (!life) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>SmolLyfe v1.00.03</Text>
        <TouchableOpacity style={styles.startButton} onPress={() => setShowCharCreation(true)}>
          <Text style={styles.startButtonText}>Start New Life</Text>
        </TouchableOpacity>
        <CharCreationModal />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.nameText}>{life.firstName} {life.lastName}</Text>
          <Text style={styles.subtitleText}>{life.occupation} · {life.city}</Text>
        </View>
        <Text style={styles.moneyText}>${life.money}</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.ageText}>Age: {life.age}</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Intelligence</Text>
          <View style={styles.statBarBg}>
            <View style={[styles.statBarFill, { width: `${life.intelligence}%`, backgroundColor: '#9b59b6' }]} />
          </View>
          <Text style={styles.statValue}>{life.intelligence}/100</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Attractiveness</Text>
          <View style={styles.statBarBg}>
            <View style={[styles.statBarFill, { width: `${life.attractiveness}%`, backgroundColor: '#e74c3c' }]} />
          </View>
          <Text style={styles.statValue}>{life.attractiveness}/100</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Stress</Text>
          <View style={styles.statBarBg}>
            <View style={[styles.statBarFill, { width: `${life.stress}%`, backgroundColor: '#e67e22' }]} />
          </View>
          <Text style={styles.statValue}>{life.stress}/100</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Fame</Text>
          <View style={styles.statBarBg}>
            <View style={[styles.statBarFill, { width: `${life.fame}%`, backgroundColor: '#f39c12' }]} />
          </View>
          <Text style={styles.statValue}>{life.fame}/100</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'home' && styles.tabActive]} onPress={() => setActiveTab('home')}>
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'occupation' && styles.tabActive]} onPress={() => setActiveTab('occupation')}>
          <Text style={styles.tabText}>Occupation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'relationships' && styles.tabActive]} onPress={() => setActiveTab('relationships')}>
          <Text style={styles.tabText}>Relationships</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'activities' && styles.tabActive]} onPress={() => setActiveTab('activities')}>
          <Text style={styles.tabText}>Activities</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'home' && (
          <>
            <Text style={styles.sectionTitle}>History</Text>
            {Object.keys(life.history)
              .sort((a, b) => b - a)
              .map((age) => (
                <View key={age} style={styles.historyBlock}>
                  <Text style={styles.historyAge}>Age {age}</Text>
                  {life.history[age].map((event, i) => (
                    <Text key={i} style={styles.historyEvent}>• {event}</Text>
                  ))}
                </View>
              ))}
          </>
        )}

        {activeTab === 'occupation' && (
          <>
            <Text style={styles.sectionTitle}>Current Status: {life.occupation}</Text>
            {life.age >= 5 && life.age < 18 && (
              <View style={styles.section}>
                <Text style={styles.subsectionTitle}>School</Text>
                <TouchableOpacity style={styles.actionButton} onPress={handleStudyHarder}>
                  <Text style={styles.actionButtonText}>Study Harder</Text>
                </TouchableOpacity>
              </View>
            )}
            {life.age >= 13 && (
              <View style={styles.section}>
                <Text style={styles.subsectionTitle}>Freelance Gigs</Text>
                <Text style={styles.helperText}>Max 3 per year.</Text>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleFreelanceGig('tutor')}>
                  <Text style={styles.actionButtonText}>Tutor</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleFreelanceGig('mowLawn')}>
                  <Text style={styles.actionButtonText}>Mow Lawn</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {activeTab === 'relationships' && (
          <>
            <Text style={styles.sectionTitle}>Relationships</Text>
            <Text style={styles.subsectionTitle}>Family</Text>
            {life.relationships.map((person) => (
              <TouchableOpacity
                key={person.id}
                style={styles.personCard}
                onPress={() => {
                  setSelectedPerson(person);
                  setShowInteractionModal(true);
                }}
              >
                <View>
                  <Text style={styles.personName}>{person.firstName} {person.lastName}</Text>
                  <Text style={styles.personDetail}>{person.relation} · Age {person.age} · {person.occupation}</Text>
                </View>
                <View style={styles.bondBarSmall}>
                  <View style={[styles.bondBarFill, { width: `${person.bond}%` }]} />
                </View>
              </TouchableOpacity>
            ))}

            {life.classmates.length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Classmates</Text>
                {life.classmates.map((person) => (
                  <TouchableOpacity
                    key={person.id}
                    style={styles.personCard}
                    onPress={() => {
                      setSelectedPerson(person);
                      setShowInteractionModal(true);
                    }}
                  >
                    <View>
                      <Text style={styles.personName}>{person.firstName} {person.lastName}</Text>
                      <Text style={styles.personDetail}>{person.relation} · Bond: {person.bond}/100</Text>
                      <Text style={styles.personDetail}>Status: {person.relationshipStatus}</Text>
                    </View>
                    <View style={styles.bondBarSmall}>
                      <View style={[styles.bondBarFill, { width: `${person.bond}%` }]} />
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}

        {activeTab === 'activities' && (
          <>
            <Text style={styles.sectionTitle}>Mind & Body</Text>
            <Text style={styles.helperText}>Max 3 per year.</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleActivity('run')}>
              <Text style={styles.actionButtonText}>Go for a run</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleActivity('meditate')}>
              <Text style={styles.actionButtonText}>Meditate</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.ageButton} onPress={handleAgeUp}>
        <Text style={styles.ageButtonText}>+ Age</Text>
        <Text style={styles.ageButtonSubtext}>Tap to live the next year.</Text>
      </TouchableOpacity>

      <InteractionModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  nameText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitleText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  moneyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  statsCard: {
    backgroundColor: '#1a1a1a',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  ageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    color: '#ccc',
    fontSize: 14,
    width: 120,
  },
  statBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    color: '#999',
    fontSize: 12,
    marginLeft: 10,
    width: 50,
    textAlign: 'right',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ccc',
    marginTop: 20,
    marginBottom: 10,
  },
  historyBlock: {
    marginBottom: 20,
  },
  historyAge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 8,
  },
  historyEvent: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  personCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  personDetail: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  bondBarSmall: {
    width: 80,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bondBarFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  actionButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ageButton: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
    margin: 20,
    borderRadius: 12,
  },
  ageButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  ageButtonSubtext: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 100,
  },
  startButton: {
    backgroundColor: '#3498db',
    padding: 20,
    margin: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1a1a1a',
    width: '85%',
    padding: 25,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  smallButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  smallButtonActive: {
    backgroundColor: '#3498db',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
