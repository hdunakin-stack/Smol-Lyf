import React, { useState } from "react";
import { Text, View, TouchableOpacity, Modal, ScrollView } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import AccordionSection from "../layout/AccordionSection.js";

function isParent(person) {
  return person?.relation === "Mother" || person?.relation === "Father";
}

function isFamilyMember(person) {
  return isParent(person) || String(person?.relation || "").includes("Sibling") || person?.relationshipStatus === "family";
}

function isRomanticStatus(status) {
  return ["dating", "engaged", "married", "committed", "talking", "romantic-interest"].includes(status);
}

function buildAction(label, action, style = "primary", available = true) {
  return available ? { label, action, style } : null;
}

export default function InteractionModal({ visible, selectedPerson, life, onInteraction, onClose }) {
  const [expandedSections, setExpandedSections] = useState({
    friendly: true,
    funny: false,
    romantic: false,
    malicious: false,
    requests: false,
  });

  if (!selectedPerson) return null;

  const age = Number(life?.age || 0);
  const isInfantOrToddler = age <= 4;
  const isChild = age >= 5 && age <= 11;
  const isPreteen = age >= 12 && age <= 13;
  const isTeen = age >= 14 && age <= 17;
  const isAdult = age >= 18;
  const isElder = age >= 60;
  const isFamily = isFamilyMember(selectedPerson);
  const parent = isParent(selectedPerson);
  const isFriend = selectedPerson.relationshipStatus === "friend";
  const isDating = selectedPerson.relationshipStatus === "dating";
  const isEngaged = selectedPerson.relationshipStatus === "engaged";
  const isMarried = selectedPerson.relationshipStatus === "married";
  const isLover = isRomanticStatus(selectedPerson.relationshipStatus);
  const inSchool = age >= 5 && age < 18;
  const canRomance = !isFamily && !isInfantOrToddler;
  const canGift = age >= 8;

  function toggleSection(sectionKey) {
    setExpandedSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  }

  const categories = [
    {
      key: "friendly",
      title: "Friendly",
      actions: [
        buildAction("Reach for attention", "reachAttention", "primary", isInfantOrToddler),
        buildAction("Babble at them", "babbleAt", "primary", isInfantOrToddler),
        buildAction("Show them a toy", "showToy", "primary", isInfantOrToddler),
        buildAction("Spend Time", "spendTime", "primary", !isInfantOrToddler),
        buildAction("Compliment", "compliment", "secondary", !isInfantOrToddler && !isFamily),
        buildAction("Give Gift", "giveGift", "secondary", canGift && !isFamily),
        buildAction("Ask to be friends", "befriend", "primary", !isFamily && !isFriend && age >= 5),
        buildAction("Ask to be best friends", "askBestFriend", "secondary", !isFamily && isFriend && age >= 5),
        buildAction("Play outside", "playOutside", "primary", !isFamily && inSchool),
        buildAction("Ask to go to their house", "askGoToHouse", "secondary", !isFamily && age >= 5 && age <= 13),
        buildAction("Study together", "studyTogether", "secondary", !isFamily && inSchool),
        buildAction("Talk about school crush", "talkCrush", "secondary", canRomance && (isChild || isPreteen)),
        buildAction("Tell them your dream", "tellDream", "secondary", age >= 10),
        buildAction("Take them to dinner", "takeToDinner", "primary", isAdult && isFamily),
        buildAction("Have family dinner", "familyDinner", "primary", isAdult && isFamily),
        buildAction("Make a nostalgic call", "nostalgicCall", "secondary", isElder),
      ].filter(Boolean),
    },
    {
      key: "funny",
      title: "Funny",
      actions: [
        buildAction("Make a silly face", "sillyFace", "secondary", true),
        buildAction("Tell a joke", "tellJoke", "secondary", age >= 5),
        buildAction("Playfully tease", "playfulTease", "secondary", age >= 10),
        buildAction("Send a meme", "sendMeme", "secondary", age >= 10),
        buildAction("Post together", "postTogether", "secondary", age >= 12 && !isFamily),
      ].filter(Boolean),
    },
    {
      key: "romantic",
      title: "Romantic",
      actions: [
        buildAction("Ask parents for a supervised date", "askSupervisedDate", "secondary", canRomance && isPreteen),
        buildAction(isDating ? "Go on Date" : "Ask on Date", "askOnDate", "primary", canRomance && age >= 13),
        buildAction("Go on a teen date", "teenDate", "primary", canRomance && age >= 13 && age < 18 && isLover),
        buildAction("Mess around", "messAround", "secondary", canRomance && isTeen && isLover),
        buildAction("Define the relationship", "defineRelationship", "secondary", canRomance && age >= 13 && !isMarried),
        buildAction("Invite on vacation", "vacationInvite", "secondary", canRomance && isAdult && isLover),
        buildAction("Propose", "propose", "secondary", canRomance && isDating && isAdult),
        buildAction("Get Married", "marry", "secondary", canRomance && isEngaged && isAdult),
      ].filter(Boolean),
    },
    {
      key: "malicious",
      title: "Malicious",
      actions: [
        buildAction("Bite or slobber", "biteSlobber", "danger", isInfantOrToddler),
        buildAction("Argue", "argue", "danger", !isInfantOrToddler && (isFamily || isLover || isFriend)),
        buildAction("Insult", "insult", "danger", !isInfantOrToddler && !isFamily),
        buildAction("Bully", "bully", "danger", inSchool && !isFamily),
        buildAction("Cyberbully", "cyberbully", "danger", age >= 10 && !isFamily),
        buildAction("Steal something small", "stealSmall", "danger", age >= 5 && !isFamily),
        buildAction("Sabotage them", "sabotage", "danger", isAdult && !isFamily),
      ].filter(Boolean),
    },
    {
      key: "requests",
      title: "Requests",
      actions: [
        buildAction("Ask for food", "askFood", "secondary", isInfantOrToddler && parent),
        buildAction("Ask for snack", "askSnack", "secondary", age >= 2 && age < 12 && parent),
        buildAction("Ask for Money", "askMoney", "secondary", parent),
        buildAction("Ask for allowance", "askAllowance", "secondary", parent && age >= 8 && age < 18),
        buildAction("Ask for a phone", "askPhone", "secondary", parent && age >= 10 && age < 18),
        buildAction("Ask about a car", "askCar", "secondary", parent && age >= 15 && age < 22),
        buildAction("Ask for driving practice", "askDrivingPractice", "secondary", parent && age >= 15 && !life?.licenses?.drivers),
        buildAction("Ask for Help in School", "askHelp", "secondary", parent && inSchool),
        buildAction("Ask to hang out", "askHangout", "secondary", !isFamily && age >= 14),
      ].filter(Boolean),
    },
  ].filter((category) => category.actions.length);

  function renderActionButton(item) {
    const buttonStyle =
      item.style === "danger"
        ? styles.feedSecondaryButton
        : item.style === "secondary"
          ? styles.actionButtonSecondary
          : styles.actionButton;
    const textStyle =
      item.style === "danger"
        ? styles.feedSecondaryButtonText
        : item.style === "secondary"
          ? styles.actionButtonSecondaryText
          : styles.actionButtonText;

    return (
      <TouchableOpacity key={item.action} style={buttonStyle} onPress={() => onInteraction(item.action)}>
        <Text style={textStyle}>{item.label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedPerson.firstName} {selectedPerson.lastName}</Text>
            <Text style={styles.modalSubtitle}>{selectedPerson.relation} - Bond {Math.round(Number(selectedPerson.bond || 0))}%</Text>
            <Text style={styles.modalStatusText}>Status: {selectedPerson.relationshipStatus}</Text>
            {selectedPerson.clique ? <Text style={styles.modalStatusText}>Group: {selectedPerson.clique}</Text> : null}
          </View>

          <ScrollView style={styles.modalScrollBody} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            {categories.map((category) => (
              <AccordionSection
                key={category.key}
                title={category.title}
                expanded={expandedSections[category.key]}
                onToggle={() => toggleSection(category.key)}
              >
                <View style={styles.stackedButtonGroup}>
                  {category.actions.map(renderActionButton)}
                </View>
              </AccordionSection>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
