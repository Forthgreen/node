import mocha from 'mocha';
import chai from 'chai';
import { expect } from 'chai';
import { AdminModel } from "../../../server/model" //"../model"
import { SUCCESS_CODE } from '../../../server/constants';
chai.should();

describe('It should get the Admin Dashboard', () => {
	it('Should succeed getting admin dashboard', (done) => {
		AdminModel.AdminDashboardService({})
			.then(success => {
          expect(success.code).to.equal(SUCCESS_CODE);
          expect(success).should.be.a('object')
				  done();
      })
      .catch(err => done(err));
      
	});
});