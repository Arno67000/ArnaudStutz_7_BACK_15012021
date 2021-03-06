import { Request, Response, NextFunction } from "express";
import * as bcrypt from 'bcrypt';
import { getRepository } from "typeorm";
import { User } from '../entity/User';
import * as jwebtkn from 'jsonwebtoken';


export async function signup(req: Request, res: Response, next: NextFunction) {

    const repo = getRepository(User);
    //Vérification de la disponibilité du pseudo (pseudo unique)
    const checkingPseudo = await repo.findOne({pseudo: encodeURI(req.body.pseudo)}) || undefined;
    if(checkingPseudo) {
        return res.status(400).json({ message: 'Pseudo déjà utilisé'});
    }
    bcrypt.hash(req.body.password, 15)
        .then((hash:string) => {
            const user = new User();
            user.firstName =  Buffer.from(req.body.firstName, 'binary').toString('base64');
            user.lastName = Buffer.from(req.body.lastName, 'binary').toString('base64');
            user.pseudo = encodeURI(req.body.pseudo);
            user.password = hash;
            if(req.body.pseudo === "admin") {
                user.role = "Moderateur";
            } else {
                user.role = "User";
            }
            repo.save(user).then(() => res.status(201).json({message: 'Nouvel utilisateur enregistré ! '}))
                .catch(err => res.status(500).json({ 'Error': err }));
        })
        .catch(err => res.status(500).json({ 'Error': err }));
}

export async function login(req: Request, res: Response, next: NextFunction) {

    const repo = getRepository(User);

    const user = await repo.findOne({pseudo: encodeURI(req.body.pseudo)}).catch(err => res.status(500).json({ 'Error': err }));
    if(user instanceof User) {
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (valid) {
                return res.status(200).json({
                    pseudo: decodeURI(user.pseudo),
                    firstName: Buffer.from(user.firstName, "base64").toString('utf-8'),
                    lastName: Buffer.from(user.lastName, "base64").toString('utf-8'),
                    role: user.role,
                    id: user.id,
                    token: jwebtkn.sign(
                        {
                            id: user.id,
                            role: user.role,
                        },
                        'CRYPTAGEDUTOKEN2226080389',
                        { expiresIn: '24h'}
                    )
                });

            } else {
                return res.status(403).json({ message: 'Mot de passe invalide.'});
            }
        })
        .catch(err => res.status(500).json({ 'Error': err }));
                            
    } else {
        return res.status(404).json({message: 'Pseudo non valide !!'});
    }
};


export async function deleteUser(req: Request, res:Response, next: NextFunction) {
    //Comparaison de l'Id du token avec l'Id utilisateur de la requête
    if(req.params.userId === req.body.allowedUser.id ) {
        const repo = getRepository(User);
        const user = await repo.findOne({id:req.params.userId}).catch(error => console.log('aucun utilisateur trouvé avec cet id : ',error))
        if (user instanceof User) {
            console.log('Supression de : ', user);
            repo.remove(user)
                .then(() => res.status(200).json({message: 'Profil supprimé!!'}))
                .catch(err => res.status(500).json({message: err}));
        } else {
            return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet identifiant !!'});
        };
    } else {
        return res.status(403).json({ error: 'Cette requête nécessite une authentification !!'});
    }   
}


export async function getCurrentUser(req:Request, res:Response, next: NextFunction) {

    //Confirmation du token valide
    if (req.body.allowedUser) {
        const repo = getRepository(User);
        await repo.findOne({id: req.body.allowedUser.id})
                .then(user => res.status(200).json({
                    pseudo: decodeURI(user.pseudo),
                    firstName: Buffer.from(user.firstName, "base64").toString('utf-8'),
                    lastName: Buffer.from(user.lastName, "base64").toString('utf-8'),
                    role: user.role,
                    id: user.id
                }))
                .catch(err => res.status(404).json({ message: `Aucun utilisateur trouvé avec cet identifiant :${err}`}));
    } else {
        return res.status(403).json({ error: 'Cette requête nécessite une authentification !!'});
    }
};


export async function modifyUsersPass(req:Request, res:Response, next: NextFunction) {

    //Comparaison de l'Id du token avec l'Id utilisateur de la requête
    if (req.body.allowedUser && req.body.allowedUser.id === req.params.userId) {
        const repo = getRepository(User);

        const user = await repo.findOne({id: req.params.userId}).catch(err => res.status(500).json({message: err}));
        if (user instanceof User) {
            try {

                await bcrypt.compare(req.body.oldPass, user.password)  //Vérification du Mot-de-passe à changer
                    .then(valid => {
                        if(valid) {
                            return true;
                        } else {
                            return res.status(403).json({ message: 'Mot de passe invalide.'});
                        };    
                    })
                    .catch(err => res.status(500).json({ 'Error': err }));
                
                bcrypt.hash(req.body.password,15)  // Cryptage du nouveau mot de passe
                    .then((hash:string) => {
                        //mise à jour du mot-de-passe
                        user.password = hash;
                        repo.save(user)
                            .then(() => res.status(200).json({ message: 'Le mot de passe à bien été modifié !!'}))
                            .catch(error => {
                                console.log(error);
                                return res.status(500).json({ error });
                            });
                    })
                    .catch(err => res.status(500).json({ 'Error': err }));

            }
            catch (err) {
                throw err;
            };

        } else {
            return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet identifiant !!'});
        };
    } else {
        return res.status(403).json({ message: 'Cette requête nécessite une authentification !!'});
    };
}
