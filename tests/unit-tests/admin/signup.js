import mocha from 'mocha';
import chai from 'chai';
import { expect } from 'chai';
import { AdminModel } from "../../../server/model" 
import { SUCCESS_CODE, SECRET_KEY } from '../../../server/constants';
chai.should();

describe('It should sign up a new admin', () => {
	it('Should succeed in signing up an admin', (done) => {
        const props = {
                        email: "test@admin.com",
                        password: "password",
                        secretKey: SECRET_KEY
        };
		AdminModel.AdminSignupService(props)
			.then(success => {
          expect(success.code).to.equal(SUCCESS_CODE);
          expect(success).should.be.a('object')
				  done();
      })
      .catch(err => done(err));
      
	});
});