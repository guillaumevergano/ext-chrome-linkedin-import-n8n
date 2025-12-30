# 🚀 LinkedIn Prospect → n8n

Extension Chrome pour envoyer des prospects LinkedIn vers n8n via webhook.

![Version](https://img.shields.io/badge/version-1.5.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Fonctionnalités

### 📋 Extraction automatique des données
- Nom, titre, entreprise, localisation
- Photo de profil
- Statut de connexion (connecté ou non)

### 🏷️ Types de prospects
| Affichage | Valeur envoyée |
|-----------|----------------|
| 🎯 Client (par défaut) | `client` |
| 🤝 Partenaire | `partenaire` |
| 🔧 Prestataire | `prestataire` |
| 🏢 Agence | `agence` |
| 👔 Recrutement | `recrutement` |

### 🔥 Niveau d'intérêt
| Affichage | Valeur envoyée |
|-----------|----------------|
| 🔥 Faible (par défaut) | `1` |
| 🔥🔥 Moyen | `2` |
| 🔥🔥🔥 Fort | `3` |

### 🎬 Actions
| Affichage | Valeur envoyée |
|-----------|----------------|
| ⏸️ Ne rien faire (par défaut) | `none` |
| 💬 Envoyer un DM sur LinkedIn | `dm_linkedin` |
| 📧 Envoyer un e-mail | `email` |
| 📞 Appeler | `call` |
| 🔄 Ajouter à une séquence | `sequence` |

### 💬 Commentaire personnalisé
Ajoutez une note pour chaque prospect.

### 📍 Compatible avec
- LinkedIn classique (`linkedin.com/in/...`)
- LinkedIn Sales Navigator (`linkedin.com/sales/...`)

---

## 📦 Installation

1. **Télécharger l'extension**
   - Téléchargez le ZIP et décompressez-le

2. **Ouvrir Chrome Extensions**
   - Allez sur `chrome://extensions/`
   - Activez le **Mode développeur** (toggle en haut à droite)

3. **Charger l'extension**
   - Cliquez sur **"Charger l'extension non empaquetée"**
   - Sélectionnez le dossier de l'extension

---

## ⚙️ Configuration

1. Cliquez sur l'icône de l'extension
2. Cliquez sur l'engrenage ⚙️ (Paramètres)
3. Entrez votre **URL de webhook n8n**
4. Cliquez sur **Tester** pour vérifier la connexion
5. Cliquez sur **Sauvegarder**

---

## 🚀 Utilisation

1. Ouvrez un profil LinkedIn
2. Cliquez sur l'icône de l'extension
3. Sélectionnez le type de prospect et le niveau d'intérêt
4. Choisissez l'action à effectuer
5. Ajoutez un commentaire (optionnel)
6. Cliquez sur **Envoyer vers n8n**

Un overlay vert **"Prospect bien transmis !"** apparaîtra en cas de succès.

---

## 📤 Format des données envoyées

```json
{
  "name": "Jean Dupont",
  "title": "CEO @ TechCorp",
  "company": "TechCorp",
  "location": "Paris, France",
  "avatar": "https://...",
  "isConnected": true,
  "profileUrl": "https://www.linkedin.com/in/jean-dupont/",
  "prospectType": "client",
  "interestLevel": 1,
  "action": "none",
  "comment": "Intéressé par notre solution",
  "source": "linkedin-prospect-n8n",
  "capturedAt": "2025-01-15T10:30:00.000Z"
}
```

---

## 🔧 Configuration n8n

1. Créez un nouveau workflow
2. Ajoutez un nœud **Webhook** (méthode POST)
3. **Activez le workflow** (toggle ON)
4. Copiez l'**URL de production**

---

## 🔒 Confidentialité

- ✅ L'URL du webhook est stockée **localement** dans Chrome
- ✅ Aucune donnée n'est envoyée à des serveurs tiers
- ✅ Les données vont directement à votre instance n8n

---

## 🐛 Dépannage

### Erreur 404 lors de l'envoi
- Vérifiez que le **workflow n8n est actif**
- Utilisez l'URL de **production**, pas l'URL de test

### Le nom n'apparaît pas
- Assurez-vous d'être sur une page de profil LinkedIn
- Rafraîchissez la page

---

## 📝 Changelog

### v1.5.3
- ✨ La popup se ferme automatiquement après l'envoi réussi d'un prospect

### v1.5.2
- 📚 Documentation des valeurs envoyées (prospectType, interestLevel, action)

### v1.5.1
- 🐛 Correction du blocage sur "Chargement..." (communication popup ↔ content script)

### v1.5.0
- 🔄 Simplification : retrait des champs experience, about, education, connectionDegree, currentCompany
- 🔄 Retrait des boutons [+] sur les pages LinkedIn
- ✨ Nouvel overlay plein écran pour les messages de succès/erreur
- 🎨 Meilleure visibilité des confirmations d'envoi

### v1.4.0
- ✨ Ajout de l'option "Ne rien faire" comme action par défaut

### v1.3.x
- Ajout des boutons [+] sur les pages LinkedIn (retiré en v1.5.0)
- Corrections diverses

### v1.0.0
- 🎉 Version initiale

---

## 📄 Licence

MIT License

---

**Made with ❤️ pour automatiser la prospection LinkedIn**
