import mocha from 'mocha';
import chai from 'chai';
import { expect } from 'chai';
import { AdminModel } from "../../../server/model" 
import { SUCCESS_CODE } from '../../../server/constants';
chai.should();

describe('It should get the Admin Logged in', () => {
	it('Should succeed getting admin logged in', (done) => {
        const props = {
                            email: "abhinav.appknit@gmail.com",
                            password: "password"
        }
		AdminModel.AdminLoginService(props)
			.then(success => {
          expect(success.code).to.equal(SUCCESS_CODE);
          expect(success).should.be.a('object')
				  done();
      })
      .catch(err => done(err));
      
	});
});