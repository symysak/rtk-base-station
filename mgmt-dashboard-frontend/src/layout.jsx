import React from 'react';
import {
    Masthead,
    MastheadBrand,
    MastheadContent,
    MastheadMain,
    MastheadToggle,
    Nav,
    NavGroup,
    NavItem,
    NavList,
    Page,
    PageSidebar,
    PageSidebarBody,
    PageToggleButton,
    Toolbar,
    ToolbarContent
} from "@patternfly/react-core";
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import { Link } from 'react-router-dom';

function Layout(props) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    
    const onSidebarToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const headerToolbar = (
        <Toolbar id="vertical-toolbar">
            <ToolbarContent>
                {/* <ToolbarItem> </ToolbarItem> */}
            </ToolbarContent>
        </Toolbar>
    );

    const header = (
        <Masthead>
            <MastheadToggle>
                <PageToggleButton
                    variant="plain"
                    aria-label="Global navigation"
                    isSidebarOpen={isSidebarOpen}
                    onSidebarToggle={onSidebarToggle}
                    id="vertical-nav-toggle"
                >
                    <BarsIcon />
                </PageToggleButton>
            </MastheadToggle>
            <MastheadMain>
                <MastheadBrand>RTK-GNSS基準局 設定画面</MastheadBrand>
            </MastheadMain>
            <MastheadContent>{headerToolbar}</MastheadContent>
        </Masthead>
    );

    const sidebar = (
        <PageSidebar isSidebarOpen={isSidebarOpen} id="vertical-sidebar">
            <PageSidebarBody>
                <Nav aria-label="Nav">
                    <NavList>
                        <NavItem>
                            <Link to="/">簡単設定</Link>
                        </NavItem>
                    </NavList>
                    <NavGroup
                        title="受信機設定"
                    >
                        <NavItem>
                            <Link to="/satelite">使用する衛星</Link>
                        </NavItem>
                    </NavGroup>
                </Nav>
            </PageSidebarBody>
        </PageSidebar>
    );
    return (
        <Page header={header} sidebar={sidebar}>
            {props.children}
        </Page>
    );
}
export default Layout;