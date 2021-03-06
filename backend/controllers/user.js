const User = require('../models/user');
// Pour le moment, cet import sert seulement pour des vérifications pendant le développement
const Film = require('../models/film');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('../models/user');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                nickname: req.body.nickname,
                password: hash,
                isAdmin: false
            });
            user.save()
                .then(user => {
                    res.status(201).json('Utilisateur créé!')
                })
                .catch(error => res.status(400).json(error));
        })
        .catch(error => res.status(500).json(error));
};

exports.signin = (req, res, next) => {
    // On cherche l'utilisateur
    User.findOne({ nickname: req.body.nickname })
        .then(user => {
            if (user) {
                // Une fois trouvé, on compare son password crypté à ce qu'il y a dans la DB
                bcrypt.compare(req.body.password, user.password)
                    .then(result => {
                        if (result) {
                            // Si le résultat est positif, alors on renvoie les infos de l'utilisateur
                            res.status(200).json({
                                userId: user.id,
                                nickname: user.nickname,
                                isAdmin: user.isAdmin,
                                likedFilmsId: user.likedFilmsId,
                                dislikedFilmsId: user.dislikedFilmsId,
                                opinionsId: user.opinionsId,
                                likedOpinionsId: user.likedOpinionsId,
                                // Et le JWT
                                token: jwt.sign(
                                    { userId: user.id },
                                    'RANDOM_TOKEN_SECRET'
                                    // { expiresIn: 120 }
                                )
                            })
                        }
                        else {
                            res.status(401).json({ error: "Mot de passe incorrect" });
                        }
                    })
                    .catch(error => res.status(500).json(error));
            }
            else {
                res.status(404).json({ error: "Utilisateur non trouvé" });
            }
        })
        .catch(error => res.status(500).json(error));
};

exports.getOneUser = (req, res, next) => {
    User.findOne({ _id: req.params.id })
        .then(user => res.status(200).json(user))
        .catch(error => res.status(404).json(error));
};

// exports.addNotice = (req, res, next) => {
//     console.log("Entrée dans userController.addNotice");
//     console.log("req.params.userId = " + req.params.userId);
//     // On cherche l'utilisateur pour trouver sa liste d'avis et la mettre à jour
//     User.find({ _id: req.params.userId })
//         .then(user => {
//             console.log('Utilisateur trouvé');
//             console.log("User.noticesFilmsId : " + user.noticesFilmsId);

//             let decision = true;
//             // On ajoute l'avis que si cet avis n'est pas déjà présent dans la liste
//             try {
//                 decision = (user.noticesFilmsId.includes(req.params.filmId)) ? false : true;
//             }
//             catch (e) {
//                 // Si la liste est vide, l'erreur est catchée et on sait qu'on peut ajouter l'avis
//                 decision = true;
//             }

//             if (decision) {
//                 console.log("Cet avis n'existait pas encore");
//                 // Si la liste est vide, elle est considérée comme undefined et donc on doit explicitement assigner une liste vide
//                 const newNoticesFilmsId = (user.noticesFilmsId) ? user.noticesFilmsId : [];
//                 newNoticesFilmsId.push(req.params.filmId);
//                 console.log("On lance l'update");
//                 User.findOneAndUpdate(
//                     { _id: req.params.userId },
//                     { noticesFilmsId: newNoticesFilmsId },
//                     { new: true }
//                 ).then(updatedUser => {
//                     console.log("Succès de l'update");
//                     res.status(201).json(updatedUser);
//                 })
//                     .catch(error => {
//                         console.log("Erreur de l'update");
//                         res.status(400).json({ Error: error });
//                     });
//             }
//             else {
//                 res.status(400).json("Ajout d'avis annulé : avis existant déjà...");
//             }
//         })
//         .catch(error => {
//             console.log("Utilisateur non-trouvé");
//             console.log(error);
//             res.status(404).json({ message: "Utilisateur non-trouvé", error });
//         })

// };

// exports.eraseNotice = (req, res, next) => {
//     console.log("Entrée dans userController.eraseNotice");
//     const filmId = req.params.filmId;
//     console.log("Id à supprimer : " + filmId);
//     const userId = req.params.userId;
//     User.findOne({ _id: userId })
//         .then(user => {
//             console.log("User trouvé");
//             console.log("Liste actuelle : " + user.noticesFilmsId);
//             const index = user.noticesFilmsId.indexOf(filmId);
//             console.log("Index à supprimer : " + index);
//             let userNewList = user.noticesFilmsId;
//             userNewList.splice(index, 1);
//             console.log('Nouvelle liste : ' + userNewList);
//             User.findOneAndUpdate(
//                 { _id: userId },
//                 { noticesFilmsId: userNewList },
//                 { new: true }
//             )
//                 .then(updatedUser => {
//                     console.log("Avis supprimé dans l'user");
//                     console.log("Supprimons-le maintenant dans le film");

//                 })
//                 .catch(error => {
//                     console.log("Erreur lors de la modification de l'utilisateur");
//                     res.status(400).json(error);
//                 });
//         })
//         .catch(error => {
//             console.log('Utilisateur non trouvé');
//             res.status(404).json(error);
//         });
// };


// Utilisée seulement pendant le développement
exports.getLikedFilms = (req, res, next) => {
    let filmsList = [];
    User.findOne({ _id: req.params.id })
        .then(user => {
            const limit = user.likedFilmsId.length;
            let i = 0;
            user.likedFilmsId.forEach(filmId => {
                Film.findOne({ _id: filmId })
                    .then(film => {
                        i++;
                        filmsList.push(film.titre);
                        if (i == limit) {
                            res.status(200).json({ list: filmsList });
                        }
                    })
            });
        })
};

exports.getDislikedFilms = (req, res, next) => {
    let filmsList = [];
    User.findOne({ _id: req.params.id })
        .then(user => {
            const limit = user.dislikedFilmsId.length;
            let i = 0;
            user.dislikedFilmsId.forEach(filmId => {
                Film.findOne({ _id: filmId })
                    .then(film => {
                        i++;
                        filmsList.push(film.titre);
                        if (i == limit) {
                            res.status(200).json({ list: filmsList });
                        }
                    })
            });
        })
};

exports.getOpinions = (req, res, next) => {
    console.log("Entrée dans userController.getNoticedFilms");
    let filmsList = [];
    User.findOne({ _id: req.params.id })
        .then(user => {
            const limit = user.noticesFilmsId.length;
            if (limit > 0) {
                let i = 0;
                user.noticesFilmsId.forEach(filmId => {
                    Film.findOne({ _id: filmId })
                        .then(film => {
                            i++;
                            filmsList.push(film.titre);
                            if (i == limit) {
                                res.status(200).json({ list: filmsList });
                            }
                        })
                });
            }
            else {
                res.status(200).json("Cet utilisateur n'a donné aucun avis");
            }
        })
};

