import { Base } from 'meteor/rocketchat:models';
import {MatchingRequestStateEnum} from '../../lib/helperData'

/*
	Model for user matches that have been created after finding suitable match between users
*/


export class TandemUsersMatches extends Base {
	constructor() {
		super('tandem_users_matches');

		this.model.before.insert((userId, doc) => {
			doc.unmatched = false;
			doc.status = MatchingRequestStateEnum.PENDING;
			doc.reportedUsers = [];

		});

		this.tryEnsureIndex({
			roomId: 1,
		}, {
			unique: 1,
		});
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Insert

    /**
     * Create user match based on the user language match
     **/
	createUserMatchByLanguageMatch(requestedByUser, teacherId, usersIds, roomId, matchingLangId, symetricLangId){
		return this.insert({
			requestedBy: requestedByUser,
			users : usersIds ,
			roomId : roomId,
			matchingLanguage: {
				matchingLanguageId : matchingLangId,
				matchingLanguageTeacherId : teacherId,
			},
			symetricLanguage: {
				symetricLanguageId : symetricLangId,
				symetricLanguageTeacherId : requestedByUser
			},
		});
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Find

	/**
     * Straightforward
     **/
    findAll() {
        return this.find({});
    }

    /**
     * Straightforward
     **/
	findByUserId(userId) {
		const query = {
			users : userId,
		};
		return this.find(query);
	}

    /**
     * Straightforward
     **/
	findByUserIdAndRoomId(userId, roomId) {
		const query = {
			users : userId,
			roomId : roomId
		};
		return this.findOne(query);
	}

    /**
     * Straightforward
     **/
	findWithOptions(options){
		return this.find(options);
	}

    /**
     * Straightforward
     **/
	findMatches(userId, unmatched = false){
		return this.find({ users : userId, unmatched: unmatched});
	}

    /**
     * Straightforward
     **/
	findOneByRoomId(roomId){
		return this.findOne({roomId: roomId});
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Custom

    /**
     * Set reported users in given user match
     **/
	reportUserInMatch(fromUserId, matchId, reportedUserId, reason) {
		return this.update({_id: matchId}, {
			$push : {
				reportedUsers: { from : fromUserId , to : reportedUserId, reason: reason }
			}
		});
	}

    /**
     * Update user match state to unmatched
     **/
	unmatchMatch(matchId, state){
		return this.update({_id: matchId}, { $set : { unmatched : state}});
	}

    /**
     * Update user match status to MatchingRequestStateEnum.ACCEPTED
     **/
	acceptMatchRequest(roomId){
		return this.update({roomId: roomId}, {$set : {status : MatchingRequestStateEnum.ACCEPTED}});
	}

    /**
     * Update user match status to MatchingRequestStateEnum.Declined
     **/
	declineMatchRequest(roomId){
		return this.update({roomId: roomId}, {$set : {status : MatchingRequestStateEnum.DECLINED}});
	}

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Remove

    /**
     * Straightforward
     **/
	removeById(matchId) {
		return this.remove(matchId);
	}

    /**
     * Straightforward
     **/
    removeAll() {
        return this.remove({});
    }
}

export default new TandemUsersMatches();
